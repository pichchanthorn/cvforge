import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { CvData } from "@/lib/cv/schema";
import { formatDateRange, groupSkills, UNGROUPED_SKILLS } from "@/lib/cv/format";
import { registerPdfFonts } from "@/lib/pdf/fonts";

registerPdfFonts();

const INDIGO = "#4338ca";
const INDIGO_LIGHT = "#e0e7ff";

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansKhmer",
    fontSize: 10.5,
    color: "#1a1a1a",
  },
  header: {
    backgroundColor: INDIGO,
    paddingVertical: 28,
    paddingHorizontal: 54,
  },
  name: {
    fontSize: 20,
    color: "#ffffff",
  },
  headline: {
    marginTop: 3,
    fontSize: 10,
    color: INDIGO_LIGHT,
  },
  contact: {
    marginTop: 8,
    fontSize: 9,
    color: INDIGO_LIGHT,
  },
  body: {
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 54,
  },
  section: {
    marginBottom: 14,
  },
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 6,
  },
  sectionDot: {
    width: 6,
    height: 6,
    backgroundColor: INDIGO,
  },
  sectionHeading: {
    fontSize: 9,
    letterSpacing: 1.2,
    color: INDIGO,
    textTransform: "uppercase",
  },
  entry: { marginBottom: 8 },
  entryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  entryTitle: { fontSize: 11.5 },
  entrySubtitle: { color: "#444444" },
  entryMeta: { fontSize: 9, color: "#666666" },
  entryDate: { fontSize: 9, color: "#666666" },
  bulletRow: { flexDirection: "row", marginTop: 2 },
  bulletDot: { width: 10, fontSize: 10 },
  bulletText: { flex: 1, fontSize: 10, lineHeight: 1.4 },
  bodyText: { fontSize: 10, lineHeight: 1.4, color: "#222222" },
  twoColRow: { flexDirection: "row", gap: 20 },
  twoCol: { flex: 1 },
});

export function ModernDocument({ data }: { data: CvData }) {
  const { personalInfo, experience, education, skills, projects, languages, certifications } =
    data;

  const contactParts = [personalInfo.email, personalInfo.phone, personalInfo.location].filter(
    Boolean,
  );
  const linkParts = personalInfo.links.map((l) => l.url).filter(Boolean);
  const contactLine = [...contactParts, ...linkParts].join("   ·   ");
  const skillGroups = groupSkills(skills);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{personalInfo.fullName || "Your Name"}</Text>
          {!!personalInfo.headline && <Text style={styles.headline}>{personalInfo.headline}</Text>}
          {!!contactLine && <Text style={styles.contact}>{contactLine}</Text>}
        </View>

        <View style={styles.body}>
          {!!personalInfo.summary && (
            <View style={styles.section}>
              <Text style={styles.bodyText}>{personalInfo.summary}</Text>
            </View>
          )}

          {experience.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeadingRow}>
                <View style={styles.sectionDot} />
                <Text style={styles.sectionHeading}>Experience</Text>
              </View>
              {experience.map((item) => (
                <View key={item.id} style={styles.entry}>
                  <View style={styles.entryRow}>
                    <Text style={styles.entryTitle}>
                      {item.role || "Role"}
                      {!!item.company && <Text style={styles.entrySubtitle}> · {item.company}</Text>}
                    </Text>
                    <Text style={styles.entryDate}>
                      {formatDateRange(item.startDate, item.endDate, item.isCurrent)}
                    </Text>
                  </View>
                  {!!item.location && <Text style={styles.entryMeta}>{item.location}</Text>}
                  {item.bullets.filter(Boolean).map((bullet, i) => (
                    <View key={i} style={styles.bulletRow}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}

          {education.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeadingRow}>
                <View style={styles.sectionDot} />
                <Text style={styles.sectionHeading}>Education</Text>
              </View>
              {education.map((item) => (
                <View key={item.id} style={styles.entry}>
                  <View style={styles.entryRow}>
                    <Text style={styles.entryTitle}>{item.institution || "Institution"}</Text>
                    <Text style={styles.entryDate}>
                      {formatDateRange(item.startDate, item.endDate, item.isCurrent)}
                    </Text>
                  </View>
                  <Text style={styles.entryMeta}>
                    {[item.degree, item.fieldOfStudy].filter(Boolean).join(", ")}
                    {item.location ? ` · ${item.location}` : ""}
                  </Text>
                  {!!item.description && (
                    <Text style={[styles.bodyText, { marginTop: 2 }]}>{item.description}</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {skills.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeadingRow}>
                <View style={styles.sectionDot} />
                <Text style={styles.sectionHeading}>Skills</Text>
              </View>
              {skillGroups.map(([group, items]) => (
                <Text key={group} style={[styles.bodyText, { marginBottom: 2 }]}>
                  {group !== UNGROUPED_SKILLS && <Text style={{ color: "#000000" }}>{group}: </Text>}
                  {items.join(", ")}
                </Text>
              ))}
            </View>
          )}

          {projects.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeadingRow}>
                <View style={styles.sectionDot} />
                <Text style={styles.sectionHeading}>Projects</Text>
              </View>
              {projects.map((item) => (
                <View key={item.id} style={styles.entry}>
                  <View style={styles.entryRow}>
                    <Text style={styles.entryTitle}>
                      {item.name || "Project"}
                      {!!item.url && <Text style={styles.entrySubtitle}> · {item.url}</Text>}
                    </Text>
                    <Text style={styles.entryDate}>
                      {formatDateRange(item.startDate, item.endDate, false)}
                    </Text>
                  </View>
                  {!!item.description && <Text style={styles.bodyText}>{item.description}</Text>}
                  {item.tech.filter(Boolean).length > 0 && (
                    <Text style={styles.entryMeta}>{item.tech.filter(Boolean).join(", ")}</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {(languages.length > 0 || certifications.length > 0) && (
            <View style={styles.twoColRow}>
              {languages.length > 0 && (
                <View style={styles.twoCol}>
                  <View style={styles.sectionHeadingRow}>
                    <View style={styles.sectionDot} />
                    <Text style={styles.sectionHeading}>Languages</Text>
                  </View>
                  <Text style={styles.bodyText}>
                    {languages
                      .map((l) => (l.proficiency ? `${l.name} (${l.proficiency})` : l.name))
                      .join(", ")}
                  </Text>
                </View>
              )}
              {certifications.length > 0 && (
                <View style={styles.twoCol}>
                  <View style={styles.sectionHeadingRow}>
                    <View style={styles.sectionDot} />
                    <Text style={styles.sectionHeading}>Certifications</Text>
                  </View>
                  {certifications.map((cert) => (
                    <Text key={cert.id} style={[styles.bodyText, { marginBottom: 2 }]}>
                      {cert.name}
                      {cert.issuer ? `, ${cert.issuer}` : ""}
                      {cert.issueDate ? ` — ${formatDateRange(cert.issueDate, "", false)}` : ""}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}
