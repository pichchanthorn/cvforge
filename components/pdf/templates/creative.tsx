import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { CvData } from "@/lib/cv/schema";
import { formatDateRange, groupSkills, UNGROUPED_SKILLS } from "@/lib/cv/format";
import { registerPdfFonts } from "@/lib/pdf/fonts";

registerPdfFonts();

const VIOLET = "#7c5cff";
const VIOLET_LIGHT = "#ede9fe";
const VIOLET_TEXT = "#5b3fd1";

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansKhmer",
    fontSize: 10.5,
    color: "#1a1a1a",
  },
  header: {
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: VIOLET_LIGHT,
    paddingTop: 32,
    paddingBottom: 20,
    paddingHorizontal: 54,
  },
  name: { fontSize: 22, color: "#2e1065", textAlign: "center" },
  headline: { marginTop: 3, fontSize: 10.5, color: VIOLET_TEXT, textAlign: "center" },
  contact: { marginTop: 8, fontSize: 9, color: "#525252", textAlign: "center" },
  body: {
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 54,
  },
  section: { marginBottom: 14 },
  sectionHeading: {
    fontSize: 9,
    letterSpacing: 1.2,
    color: VIOLET_TEXT,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  timeline: {
    borderLeftWidth: 2,
    borderLeftColor: VIOLET_LIGHT,
    paddingLeft: 18,
  },
  timelineItem: { position: "relative", marginBottom: 10 },
  timelineDot: {
    position: "absolute",
    top: 3,
    left: -22.5,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: VIOLET,
    backgroundColor: "#ffffff",
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

export function CreativeDocument({ data }: { data: CvData }) {
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
              <Text style={styles.sectionHeading}>Experience</Text>
              <View style={styles.timeline}>
                {experience.map((item) => (
                  <View key={item.id} style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    <View style={styles.entryRow}>
                      <Text style={styles.entryTitle}>
                        {item.role || "Role"}
                        {!!item.company && (
                          <Text style={styles.entrySubtitle}> · {item.company}</Text>
                        )}
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
            </View>
          )}

          {education.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>Education</Text>
              <View style={styles.timeline}>
                {education.map((item) => (
                  <View key={item.id} style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
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
            </View>
          )}

          {skills.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>Skills</Text>
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
              <Text style={styles.sectionHeading}>Projects</Text>
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
                  <Text style={styles.sectionHeading}>Languages</Text>
                  <Text style={styles.bodyText}>
                    {languages
                      .map((l) => (l.proficiency ? `${l.name} (${l.proficiency})` : l.name))
                      .join(", ")}
                  </Text>
                </View>
              )}
              {certifications.length > 0 && (
                <View style={styles.twoCol}>
                  <Text style={styles.sectionHeading}>Certifications</Text>
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
