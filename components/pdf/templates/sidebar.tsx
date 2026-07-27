import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { CvData } from "@/lib/cv/schema";
import { formatDateRange, groupSkills, UNGROUPED_SKILLS } from "@/lib/cv/format";
import { registerPdfFonts } from "@/lib/pdf/fonts";

registerPdfFonts();

const TEAL = "#115e59";
const TEAL_LIGHT = "#99f6e4";
const SIDEBAR_WIDTH = 176;

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    fontFamily: "NotoSansKhmer",
    fontSize: 10.5,
    color: "#1a1a1a",
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: TEAL,
    color: "#ffffff",
    paddingVertical: 32,
    paddingHorizontal: 18,
  },
  main: {
    flex: 1,
    paddingVertical: 32,
    paddingHorizontal: 28,
  },
  name: { fontSize: 17, color: "#ffffff" },
  headline: { marginTop: 3, fontSize: 9.5, color: TEAL_LIGHT },
  sideSection: { marginTop: 16 },
  sideHeading: {
    fontSize: 8.5,
    letterSpacing: 1,
    color: TEAL_LIGHT,
    textTransform: "uppercase",
    marginBottom: 5,
  },
  sideText: { fontSize: 9, color: "#f0fdfa", lineHeight: 1.4, marginBottom: 2 },
  sideGroupLabel: { fontSize: 8.5, color: TEAL_LIGHT, marginTop: 3 },
  section: { marginBottom: 14 },
  sectionHeading: {
    fontSize: 9,
    letterSpacing: 1.2,
    color: TEAL,
    textTransform: "uppercase",
    borderBottomWidth: 1.5,
    borderBottomColor: TEAL,
    paddingBottom: 3,
    marginBottom: 6,
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
});

export function SidebarDocument({ data }: { data: CvData }) {
  const { personalInfo, experience, education, skills, projects, languages, certifications } =
    data;

  const contactItems = [personalInfo.email, personalInfo.phone, personalInfo.location].filter(
    Boolean,
  );
  const skillGroups = groupSkills(skills);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.sidebar}>
          <Text style={styles.name}>{personalInfo.fullName || "Your Name"}</Text>
          {!!personalInfo.headline && <Text style={styles.headline}>{personalInfo.headline}</Text>}

          {(contactItems.length > 0 || personalInfo.links.length > 0) && (
            <View style={styles.sideSection}>
              <Text style={styles.sideHeading}>Contact</Text>
              {contactItems.map((item) => (
                <Text key={item} style={styles.sideText}>{item}</Text>
              ))}
              {personalInfo.links.map((link) => (
                <Text key={link.id} style={styles.sideText}>{link.url}</Text>
              ))}
            </View>
          )}

          {skills.length > 0 && (
            <View style={styles.sideSection}>
              <Text style={styles.sideHeading}>Skills</Text>
              {skillGroups.map(([group, items]) => (
                <View key={group}>
                  {group !== UNGROUPED_SKILLS && <Text style={styles.sideGroupLabel}>{group}</Text>}
                  <Text style={styles.sideText}>{items.join(", ")}</Text>
                </View>
              ))}
            </View>
          )}

          {languages.length > 0 && (
            <View style={styles.sideSection}>
              <Text style={styles.sideHeading}>Languages</Text>
              {languages.map((l) => (
                <Text key={l.id} style={styles.sideText}>
                  {l.name}
                  {l.proficiency ? ` — ${l.proficiency}` : ""}
                </Text>
              ))}
            </View>
          )}

          {certifications.length > 0 && (
            <View style={styles.sideSection}>
              <Text style={styles.sideHeading}>Certifications</Text>
              {certifications.map((cert) => (
                <Text key={cert.id} style={styles.sideText}>
                  {cert.name}
                  {cert.issuer ? `, ${cert.issuer}` : ""}
                </Text>
              ))}
            </View>
          )}
        </View>

        <View style={styles.main}>
          {!!personalInfo.summary && (
            <View style={styles.section}>
              <Text style={styles.bodyText}>{personalInfo.summary}</Text>
            </View>
          )}

          {experience.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>Experience</Text>
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
              <Text style={styles.sectionHeading}>Education</Text>
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
        </View>
      </Page>
    </Document>
  );
}
