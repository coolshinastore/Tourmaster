package com.tourmaster.service;

import com.tourmaster.dto.response.BookingDetailResponse;
import com.tourmaster.dto.response.BookingItemResponse;
import com.tourmaster.dto.response.ExtraServiceResponse;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.color.PDColor;
import org.apache.pdfbox.pdmodel.graphics.color.PDDeviceRGB;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class VoucherPdfService {

    private static final float W   = PDRectangle.A4.getWidth();   // 595.28
    private static final float H   = PDRectangle.A4.getHeight();  // 841.89
    private static final float LM  = 50f;   // left margin
    private static final float RM  = 545f;  // right margin
    private static final float V   = 240f;  // value column x

    private static final PDColor BLUE  = rgb(0.08f, 0.40f, 0.73f);
    private static final PDColor WHITE = rgb(1f, 1f, 1f);
    private static final PDColor DARK  = rgb(0.10f, 0.10f, 0.10f);
    private static final PDColor GRAY  = rgb(0.50f, 0.50f, 0.50f);
    private static final PDColor LGRAY = rgb(0.85f, 0.85f, 0.85f);
    private static final PDColor LBLUE = rgb(0.93f, 0.96f, 1.00f);

    public byte[] generate(BookingDetailResponse b) throws IOException {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);

            PDFont reg  = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            PDFont bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                float y = H;

                // ── Header background ──────────────────────────
                fill(cs, BLUE, 0, H - 88, W, 88);

                // Logo
                text(cs, bold, WHITE, 22, LM, H - 34, "TourMaster");
                text(cs, reg,  WHITE, 10, LM, H - 52, "Informatsiyna systema poshuku ta bronyuvannya turiv");

                // Voucher label (right)
                text(cs, bold, WHITE, 13, RM - 140, H - 34, "VAUCHER / VOUCHER");
                String num = "TM-" + String.format("%05d", b.id());
                text(cs, bold, WHITE, 18, RM - 140, H - 56, num);
                text(cs, reg,  WHITE, 10, RM - 140, H - 72, "Status: " + statusLabel(b.status()));

                y = H - 104;

                // ── Tour section ───────────────────────────────
                y = sectionHeader(cs, bold, reg, "TUR / TOUR", y);
                y = row(cs, reg, bold, "Nazva / Title:",        trunc(b.tourTitle(), 55), y, false);
                y = row(cs, reg, bold, "Krayina / Country:",    t(b.country()),           y, false);
                y = row(cs, reg, bold, "Zirkovost / Stars:",    stars(b.hotelStars()),    y, false);
                y = row(cs, reg, bold, "Kharchuvannya / Meal:", mealLabel(b.mealType()),  y, false);
                y -= 6;

                // ── Dates section ──────────────────────────────
                y = sectionHeader(cs, bold, reg, "DATY / DATES", y);
                y = row(cs, reg, bold, "Vylit / Departure:",     b.departureDate().toString(), y, false);
                y = row(cs, reg, bold, "Povernennya / Return:",  b.returnDate().toString(),    y, false);
                y = row(cs, reg, bold, "Tryvalyst / Duration:",  b.durationNights() + " nights / nochey", y, false);
                y = row(cs, reg, bold, "Misto vylotu / From:",   t(b.departureCity()),         y, false);
                y -= 6;

                // ── Tourists section ───────────────────────────
                y = sectionHeader(cs, bold, reg, "TURYSTY / TOURISTS", y);
                List<BookingItemResponse> tourists = b.tourists();
                if (tourists != null) {
                    for (int i = 0; i < tourists.size(); i++) {
                        BookingItemResponse tr = tourists.get(i);
                        String name = t(tr.firstName()) + " " + t(tr.lastName());
                        y = row(cs, reg, bold, (i + 1) + ". " + name + "  /  " + tr.passportNumber(), "", y, false);
                    }
                }
                y -= 6;

                // ── Extra services ─────────────────────────────
                List<ExtraServiceResponse> extras = b.extraServices();
                if (extras != null && !extras.isEmpty()) {
                    y = sectionHeader(cs, bold, reg, "POSLUHY / EXTRA SERVICES", y);
                    for (ExtraServiceResponse ex : extras) {
                        y = row(cs, reg, bold, "• " + t(ex.name()),
                                String.format("%.0f UAH", ex.price()), y, false);
                    }
                    y -= 6;
                }

                // ── Total ──────────────────────────────────────
                y = sectionHeader(cs, bold, reg, "SUMA / TOTAL", y);
                BigDecimal discount = b.discount() != null ? b.discount() : BigDecimal.ZERO;
                BigDecimal net = b.totalPrice().subtract(discount);
                if (discount.compareTo(BigDecimal.ZERO) > 0) {
                    y = row(cs, reg, bold, "Tsina / Price:",    String.format("%.0f UAH", b.totalPrice()), y, false);
                    y = row(cs, reg, bold, "Znyzhka / Discount:", "-" + String.format("%.0f UAH", discount), y, false);
                }
                fill(cs, LBLUE, LM - 6, y - 4, RM - LM + 12, 22);
                y = row(cs, bold, bold, "DO SPLATY / TOTAL:", String.format("%.0f UAH", net), y, true);
                y -= 6;

                // ── Footer ─────────────────────────────────────
                fill(cs, LGRAY, 0, 0, W, 44);
                String generated = "Generated: " +
                        LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm"));
                text(cs, reg, GRAY, 9, LM, 28, generated);
                text(cs, reg, GRAY, 9, LM, 16, "TourMaster — vash nadiynyy partner u podorozhakh");
                text(cs, reg, GRAY, 9, RM - 160, 16, "tourmaster.ua");
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            doc.save(baos);
            return baos.toByteArray();
        }
    }

    // ── Layout helpers ─────────────────────────────────────────

    private float sectionHeader(PDPageContentStream cs, PDFont bold, PDFont reg, String title, float y) throws IOException {
        fill(cs, BLUE, LM - 6, y - 4, RM - LM + 12, 20);
        text(cs, bold, WHITE, 9, LM, y + 2, title);
        return y - 26;
    }

    private float row(PDPageContentStream cs, PDFont labelFont, PDFont valueFont,
                      String label, String value, float y, boolean highlight) throws IOException {
        PDColor labelColor = highlight ? BLUE  : GRAY;
        PDColor valueColor = highlight ? BLUE  : DARK;
        text(cs, labelFont, labelColor, 10, LM, y, label);
        if (!value.isEmpty()) {
            text(cs, valueFont, valueColor, highlight ? 11 : 10, V, y, value);
        }
        return y - 18;
    }

    private void text(PDPageContentStream cs, PDFont font, PDColor color,
                      float size, float x, float y, String str) throws IOException {
        cs.setNonStrokingColor(color);
        cs.beginText();
        cs.setFont(font, size);
        cs.newLineAtOffset(x, y);
        cs.showText(str);
        cs.endText();
    }

    private void fill(PDPageContentStream cs, PDColor color,
                      float x, float y, float w, float h) throws IOException {
        cs.setNonStrokingColor(color);
        cs.moveTo(x, y);
        cs.lineTo(x + w, y);
        cs.lineTo(x + w, y + h);
        cs.lineTo(x, y + h);
        cs.closePath();
        cs.fill();
    }

    private static PDColor rgb(float r, float g, float b) {
        return new PDColor(new float[]{r, g, b}, PDDeviceRGB.INSTANCE);
    }

    // ── Text helpers ───────────────────────────────────────────

    private String t(String s) { return transliterate(s); }

    private String trunc(String s, int max) {
        String tr = transliterate(s);
        return tr.length() > max ? tr.substring(0, max - 1) + "…" : tr;
    }

    private String stars(Short n) {
        if (n == null || n == 0) return "—";
        return "*".repeat(n) + " (" + n + " star" + (n > 1 ? "s" : "") + ")";
    }

    private String mealLabel(String m) {
        if (m == null) return "—";
        return switch (m) {
            case "BB"  -> "BB (Breakfast)";
            case "HB"  -> "HB (Half Board)";
            case "FB"  -> "FB (Full Board)";
            case "AI"  -> "AI (All Inclusive)";
            case "UAI" -> "UAI (Ultra All Inclusive)";
            default    -> m;
        };
    }

    private String statusLabel(String s) {
        if (s == null) return "—";
        return switch (s) {
            case "NEW"       -> "NEW";
            case "CONFIRMED" -> "CONFIRMED";
            case "PAID"      -> "PAID";
            case "COMPLETED" -> "COMPLETED";
            case "CANCELLED" -> "CANCELLED";
            default          -> s;
        };
    }

    // ── Transliteration (Ukrainian → Latin) ───────────────────

    private static final Map<Character, String> TRANSLIT = new HashMap<>();
    static {
        String[][] pairs = {
            {"А","A"},{"Б","B"},{"В","V"},{"Г","H"},{"Ґ","G"},{"Д","D"},{"Е","E"},
            {"Є","Ye"},{"Ж","Zh"},{"З","Z"},{"И","Y"},{"І","I"},{"Ї","Yi"},{"Й","Y"},
            {"К","K"},{"Л","L"},{"М","M"},{"Н","N"},{"О","O"},{"П","P"},{"Р","R"},
            {"С","S"},{"Т","T"},{"У","U"},{"Ф","F"},{"Х","Kh"},{"Ц","Ts"},{"Ч","Ch"},
            {"Ш","Sh"},{"Щ","Shch"},{"Ь",""},{"Ю","Yu"},{"Я","Ya"},
            {"а","a"},{"б","b"},{"в","v"},{"г","h"},{"ґ","g"},{"д","d"},{"е","e"},
            {"є","ye"},{"ж","zh"},{"з","z"},{"и","y"},{"і","i"},{"ї","yi"},{"й","y"},
            {"к","k"},{"л","l"},{"м","m"},{"н","n"},{"о","o"},{"п","p"},{"р","r"},
            {"с","s"},{"т","t"},{"у","u"},{"ф","f"},{"х","kh"},{"ц","ts"},{"ч","ch"},
            {"ш","sh"},{"щ","shch"},{"ь",""},{"ю","yu"},{"я","ya"},
            {"Ё","Yo"},{"Ъ",""},{"Э","E"},{"ё","yo"},{"ъ",""},{"э","e"},
        };
        for (String[] p : pairs) {
            if (!p[0].isEmpty()) TRANSLIT.put(p[0].charAt(0), p[1]);
        }
    }

    private static String transliterate(String text) {
        if (text == null) return "";
        StringBuilder sb = new StringBuilder();
        for (char c : text.toCharArray()) {
            sb.append(TRANSLIT.getOrDefault(c, String.valueOf(c)));
        }
        return sb.toString();
    }
}
