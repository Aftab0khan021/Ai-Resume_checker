// ==========================================
// TEMPLATE CONFIGURATIONS - ALL SECTIONS INCLUDED
// ==========================================

export const templateConfigs = {
    // 1. MODERN (Sidebar Left)
    modern: {
        id: "modern",
        layout: "sidebar-left",
        sidebarWidth: "35%",
        colors: { sidebarBg: "#2563eb", text: "#1e293b" },
        sidebarOrder: ["header", "skills"],
        mainOrder: ["summary", "experience", "education", "projects"],
        sections: {
            header: {
                styles: {
                    container: { marginBottom: "2rem" },
                    name: { fontSize: "2.5rem", fontWeight: "700", color: "white", marginBottom: "1rem" },
                    contactRow: { display: "flex", flexDirection: "column", gap: "0.5rem" },
                    contactItem: { iconColor: "white", textColor: "white", fontSize: "0.875rem" }
                }
            },
            skills: {
                title: "Expertise",
                styles: {
                    header: { color: "white", fontSize: "1.25rem", fontWeight: "700", borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: "0.5rem", marginBottom: "1rem" },
                    list: { color: "white", variant: "bullet", fontSize: "0.875rem" }
                }
            },
            summary: {
                styles: {
                    header: { color: "#2563eb", fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem" }
                }
            },
            experience: {
                styles: {
                    header: { color: "#2563eb", fontSize: "1.5rem", fontWeight: "700", borderBottom: "2px solid #2563eb", paddingBottom: "0.5rem", marginBottom: "1.5rem" },
                    item: { titleColor: "#1e293b", titleSize: "1.1rem", titleWeight: "700", subtitleWeight: "500" }
                }
            },
            education: {
                styles: {
                    header: { color: "#2563eb", fontSize: "1.5rem", fontWeight: "700", borderBottom: "2px solid #2563eb", paddingBottom: "0.5rem", marginBottom: "1.5rem" },
                    item: { titleWeight: "700", subtitleWeight: "500" }
                }
            },
            projects: {
                styles: {
                    header: { color: "#2563eb", fontSize: "1.5rem", fontWeight: "700", borderBottom: "2px solid #2563eb", paddingBottom: "0.5rem", marginBottom: "1.5rem" },
                    item: { titleWeight: "700" }
                }
            }
        }
    },

    // 2. PROFESSIONAL (Classic Top Header)
    professional: {
        id: "professional",
        layout: "single-column",
        fontId: "serif",
        colors: { primary: "#334155" },
        sectionOrder: ["header", "summary", "experience", "education", "skills", "projects"],
        sections: {
            header: {
                styles: {
                    container: { textAlign: "center", borderBottom: "1px solid #cbd5e1", paddingBottom: "2rem", marginBottom: "2rem" },
                    name: { fontSize: "3rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "2px" },
                    contactRow: { justifyContent: "center", gap: "1.5rem" }
                }
            },
            summary: {
                styles: {
                    header: { textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem", fontSize: "1.1rem", marginBottom: "1rem" }
                }
            },
            experience: {
                styles: {
                    header: { textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem", fontSize: "1.1rem", marginBottom: "1rem" },
                    item: { titleWeight: "700", subtitleWeight: "500", subtitleStyle: "italic" }
                }
            },
            education: {
                styles: {
                    header: { textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem", fontSize: "1.1rem", marginBottom: "1rem" },
                    item: { titleWeight: "700", subtitleWeight: "500", subtitleStyle: "italic" }
                }
            },
            skills: {
                styles: {
                    header: { textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem", fontSize: "1.1rem", marginBottom: "1rem" }
                }
            },
            projects: {
                styles: {
                    header: { textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem", fontSize: "1.1rem", marginBottom: "1rem" },
                    item: { titleWeight: "700" }
                }
            }
        }
    },

    // 3. MINIMALIST (Clean Whitespace)
    minimalist: {
        id: "minimalist",
        layout: "single-column",
        fontId: "mono",
        sectionOrder: ["header", "summary", "skills", "experience", "education", "projects"],
        sections: {
            header: {
                styles: {
                    container: { marginBottom: "3rem" },
                    name: { fontSize: "2rem", fontWeight: "400" }
                }
            },
            summary: {
                styles: {
                    header: { fontSize: "1.25rem", fontWeight: "600", marginBottom: "1.5rem" }
                }
            },
            experience: {
                styles: {
                    header: { fontSize: "1.25rem", fontWeight: "600", marginBottom: "1.5rem" },
                    item: { marginBottom: "2rem", titleWeight: "600", subtitleWeight: "400" }
                }
            },
            education: {
                styles: {
                    header: { fontSize: "1.25rem", fontWeight: "600", marginBottom: "1.5rem" },
                    item: { titleWeight: "600", subtitleWeight: "400" }
                }
            },
            skills: {
                styles: {
                    header: { fontSize: "1.25rem", fontWeight: "600", marginBottom: "1.5rem" }
                }
            },
            projects: {
                styles: {
                    header: { fontSize: "1.25rem", fontWeight: "600", marginBottom: "1.5rem" },
                    item: { titleWeight: "600" }
                }
            }
        }
    },

    // 4. CREATIVE (Split Color)
    creative: {
        id: "creative",
        layout: "sidebar-left",
        sidebarWidth: "30%",
        colors: { sidebarBg: "#7c3aed" },
        sidebarOrder: ["header", "contact", "skills"],
        mainOrder: ["summary", "experience", "education", "projects"],
        sections: {
            header: {
                styles: {
                    name: { fontSize: "2rem", fontWeight: "900", color: "white", marginBottom: "1rem" },
                    contactRow: { display: "none" }
                }
            },
            contact: {
                styles: {
                    header: { color: "white", fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem" },
                    contactItem: { iconColor: "white", textColor: "white", fontSize: "0.875rem" }
                }
            },
            skills: {
                styles: {
                    header: { color: "white", fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem" },
                    list: { color: "white", variant: "bullet" }
                }
            },
            summary: {
                styles: {
                    header: { color: "#7c3aed", fontSize: "1.8rem", fontWeight: "900", marginBottom: "1.5rem" }
                }
            },
            experience: {
                styles: {
                    header: { color: "#7c3aed", fontSize: "1.8rem", fontWeight: "900", marginBottom: "1.5rem" },
                    item: { titleWeight: "700", subtitleWeight: "600" }
                }
            },
            education: {
                styles: {
                    header: { color: "#7c3aed", fontSize: "1.8rem", fontWeight: "900", marginBottom: "1.5rem" },
                    item: { titleWeight: "700", subtitleWeight: "600" }
                }
            },
            projects: {
                styles: {
                    header: { color: "#7c3aed", fontSize: "1.8rem", fontWeight: "900", marginBottom: "1.5rem" },
                    item: { titleWeight: "700" }
                }
            }
        }
    },

    // 5. TIMELINE
    timeline: {
        id: "timeline",
        layout: "single-column",
        sectionOrder: ["header", "summary", "experience", "education", "skills", "projects"],
        sections: {
            header: {
                styles: {
                    name: { fontSize: "2.5rem", fontWeight: "700", marginBottom: "0.5rem" },
                    container: { marginBottom: "2rem" }
                }
            },
            summary: {
                styles: {
                    header: { fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem" }
                }
            },
            experience: {
                styles: {
                    container: { borderLeft: "2px solid #e2e8f0", paddingLeft: "1.5rem", marginLeft: "1rem" },
                    header: { fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem" },
                    item: { marginBottom: "2rem", position: "relative", titleWeight: "700", subtitleWeight: "500", dateWeight: "500" }
                }
            },
            education: {
                styles: {
                    container: { borderLeft: "2px solid #e2e8f0", paddingLeft: "1.5rem", marginLeft: "1rem" },
                    header: { fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem" },
                    item: { marginBottom: "2rem", titleWeight: "700", subtitleWeight: "500" }
                }
            },
            skills: {
                styles: {
                    header: { fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem" }
                }
            },
            projects: {
                styles: {
                    container: { borderLeft: "2px solid #e2e8f0", paddingLeft: "1.5rem", marginLeft: "1rem" },
                    header: { fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem" },
                    item: { marginBottom: "2rem", titleWeight: "700" }
                }
            }
        }
    },

    // 6. TWO COLUMN
    twocolumn: {
        id: "twocolumn",
        layout: "grid",
        gridColumns: "1fr 1fr",
        sectionOrder: ["header", "summary", "skills", "education", "experience", "projects"],
        gridSpans: {
            header: "1 / -1",
            summary: "1 / -1",
            skills: "1 / 2",
            education: "1 / 2",
            experience: "2 / 3",
            projects: "2 / 3"
        },
        sections: {
            header: {
                styles: {
                    name: { fontSize: "2.5rem", fontWeight: "700" },
                    container: { marginBottom: "2rem" }
                }
            },
            summary: {
                styles: {
                    header: { fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem" }
                }
            },
            experience: {
                styles: {
                    header: { fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem" },
                    item: { titleWeight: "700", subtitleWeight: "500" }
                }
            },
            education: {
                styles: {
                    header: { fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem" },
                    item: { titleWeight: "700", subtitleWeight: "500" }
                }
            },
            skills: {
                styles: {
                    header: { fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem" }
                }
            },
            projects: {
                styles: {
                    header: { fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem" },
                    item: { titleWeight: "700" }
                }
            }
        }
    },

    // 7. COMPACT (ATS Friendly)
    compact: {
        id: "compact",
        layout: "single-column",
        pagePadding: "1.5rem",
        sectionOrder: ["header", "summary", "skills", "experience", "education", "projects"],
        sections: {
            header: {
                styles: {
                    name: { fontSize: "1.5rem", fontWeight: "700" },
                    container: { borderBottom: "2px solid #334155", paddingBottom: "1rem", marginBottom: "1.5rem" }
                }
            },
            summary: {
                styles: {
                    header: { fontSize: "1.1rem", fontWeight: "700", marginBottom: "0.75rem" }
                }
            },
            skills: {
                styles: {
                    header: { fontSize: "1.1rem", fontWeight: "700", marginBottom: "0.75rem" },
                    list: { variant: "text", fontSize: "0.8rem", separator: ", " }
                }
            },
            experience: {
                styles: {
                    header: { fontSize: "1.1rem", fontWeight: "700", marginBottom: "0.75rem" },
                    item: { marginBottom: "1rem", titleWeight: "700", titleSize: "0.95rem", subtitleWeight: "500", descSize: "0.85rem" }
                }
            },
            education: {
                styles: {
                    header: { fontSize: "1.1rem", fontWeight: "700", marginBottom: "0.75rem" },
                    item: { titleWeight: "700", titleSize: "0.95rem", subtitleWeight: "500" }
                }
            },
            projects: {
                styles: {
                    header: { fontSize: "1.1rem", fontWeight: "700", marginBottom: "0.75rem" },
                    item: { titleWeight: "700", titleSize: "0.95rem" }
                }
            }
        }
    },

    // 8. GRID MAGAZINE
    grid: {
        id: "grid",
        layout: "grid",
        gridColumns: "1fr 2fr",
        sectionOrder: ["header", "summary", "skills", "education", "experience", "projects"],
        gridSpans: {
            header: "1 / -1",
            summary: "1 / -1",
            skills: "1 / 2",
            education: "1 / 2",
            experience: "2 / 3",
            projects: "2 / 3"
        },
        sections: {
            header: {
                styles: {
                    name: { fontSize: "3rem", fontWeight: "900" },
                    container: { marginBottom: "2rem" }
                }
            },
            summary: {
                styles: {
                    header: { fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem" }
                }
            },
            experience: {
                styles: {
                    header: { fontSize: "1.75rem", fontWeight: "700", marginBottom: "1.5rem" },
                    item: { titleWeight: "700", subtitleWeight: "600" }
                }
            },
            education: {
                styles: {
                    header: { fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem" },
                    item: { titleWeight: "700", subtitleWeight: "500" }
                }
            },
            skills: {
                styles: {
                    header: { fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem" }
                }
            },
            projects: {
                styles: {
                    header: { fontSize: "1.75rem", fontWeight: "700", marginBottom: "1.5rem" },
                    item: { titleWeight: "700" }
                }
            }
        }
    },

    // 9. HEADER DOMINANT
    headerfocused: {
        id: "headerfocused",
        layout: "single-column",
        colors: { primary: "white", background: "#f8fafc" },
        sectionOrder: ["header", "summary", "experience", "skills", "education", "projects"],
        sections: {
            header: {
                styles: {
                    container: { backgroundColor: "#1e3a8a", padding: "3rem", marginBottom: "2rem", margin: "-2.5rem -2.5rem 2rem -2.5rem" },
                    name: { fontSize: "3.5rem", fontWeight: "900", color: "white" },
                    contactRow: { justifyContent: "center" },
                    contactItem: { textColor: "rgba(255,255,255,0.8)", iconColor: "white" }
                }
            },
            summary: {
                styles: {
                    header: { fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem" }
                }
            },
            experience: {
                styles: {
                    header: { fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem" },
                    item: { titleWeight: "700", subtitleWeight: "600" }
                }
            },
            skills: {
                styles: {
                    header: { fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem" }
                }
            },
            education: {
                styles: {
                    header: { fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem" },
                    item: { titleWeight: "700", subtitleWeight: "600" }
                }
            },
            projects: {
                styles: {
                    header: { fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem" },
                    item: { titleWeight: "700" }
                }
            }
        }
    },

    // 10. ASYMMETRIC
    asymmetric: {
        id: "asymmetric",
        layout: "sidebar-right",
        sidebarWidth: "30%",
        colors: { sidebarBg: "#f1f5f9" },
        mainOrder: ["header", "summary", "experience", "projects"],
        sidebarOrder: ["contact", "skills", "education"],
        sections: {
            header: {
                styles: {
                    name: { fontSize: "3rem", fontWeight: "900" },
                    contactRow: { display: "none" }
                }
            },
            contact: {
                styles: {
                    header: { fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem" },
                    contactItem: { fontSize: "0.875rem" }
                }
            },
            summary: {
                styles: {
                    header: { fontSize: "1.75rem", fontWeight: "700", marginBottom: "1.5rem" }
                }
            },
            experience: {
                styles: {
                    header: { fontSize: "1.75rem", fontWeight: "700", marginBottom: "1.5rem" },
                    item: { titleWeight: "700", subtitleWeight: "600" }
                }
            },
            skills: {
                styles: {
                    header: { fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem" }
                }
            },
            education: {
                styles: {
                    header: { fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem" },
                    item: { titleWeight: "700", subtitleWeight: "500" }
                }
            },
            projects: {
                styles: {
                    header: { fontSize: "1.75rem", fontWeight: "700", marginBottom: "1.5rem" },
                    item: { titleWeight: "700" }
                }
            }
        }
    },

    // 11. HORIZONTAL
    horizontal: {
        id: "horizontal",
        layout: "single-column",
        sectionOrder: ["header", "summary", "skills", "experience", "education", "projects"],
        sections: {
            header: {
                styles: {
                    name: { fontSize: "2.5rem", fontWeight: "700" },
                    container: { marginBottom: "2rem" }
                }
            },
            summary: {
                styles: {
                    header: { fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem" }
                }
            },
            skills: {
                styles: {
                    container: { backgroundColor: "#f8fafc", padding: "1.5rem", borderRadius: "8px", marginBottom: "2rem" },
                    header: { fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem" },
                    list: { variant: "tags", tagBg: "#e0e7ff", tagColor: "#3730a3", fontWeight: "600" }
                }
            },
            experience: {
                styles: {
                    header: { fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem" },
                    item: { titleWeight: "700", subtitleWeight: "500" }
                }
            },
            education: {
                styles: {
                    header: { fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem" },
                    item: { titleWeight: "700", subtitleWeight: "500" }
                }
            },
            projects: {
                styles: {
                    header: { fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem" },
                    item: { titleWeight: "700" }
                }
            }
        }
    },

    // 12. TECH MINIMALIST
    tech: {
        id: "tech",
        layout: "single-column",
        fontId: "mono",
        colors: { text: "#334155" },
        sectionOrder: ["header", "summary", "skills", "experience", "projects", "education"],
        sections: {
            header: {
                styles: {
                    container: { borderBottom: "4px solid #334155", paddingBottom: "1rem", marginBottom: "2rem" },
                    name: { fontSize: "2rem", fontWeight: "700" }
                }
            },
            summary: {
                title: "// SUMMARY",
                styles: {
                    header: { color: "#2563eb", fontSize: "1.25rem", fontWeight: "700", fontFamily: "monospace", marginBottom: "1rem" }
                }
            },
            skills: {
                title: "// SKILLS",
                styles: {
                    container: { backgroundColor: "#f1f5f9", padding: "1rem", fontFamily: "monospace", marginBottom: "2rem" },
                    header: { fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem" },
                    list: { variant: "bullet", fontSize: "0.875rem" }
                }
            },
            experience: {
                title: "// EXPERIENCE",
                styles: {
                    header: { color: "#2563eb", fontSize: "1.25rem", fontWeight: "700", fontFamily: "monospace", marginBottom: "1.5rem" },
                    item: { titleWeight: "700", subtitleWeight: "500" }
                }
            },
            projects: {
                title: "// PROJECTS",
                styles: {
                    header: { color: "#2563eb", fontSize: "1.25rem", fontWeight: "700", fontFamily: "monospace", marginBottom: "1.5rem" },
                    item: { titleWeight: "700" }
                }
            },
            education: {
                title: "// EDUCATION",
                styles: {
                    header: { color: "#2563eb", fontSize: "1.25rem", fontWeight: "700", fontFamily: "monospace", marginBottom: "1.5rem" },
                    item: { titleWeight: "700", subtitleWeight: "500" }
                }
            }
        }
    },

    // 13. EXECUTIVE SERIF
    executive: {
        id: "executive",
        layout: "single-column",
        fontId: "serif",
        colors: { background: "#fdfbf7", text: "#1c1917" },
        sectionOrder: ["header", "summary", "experience", "education", "skills", "projects"],
        sections: {
            header: {
                styles: {
                    container: { textAlign: "center", borderBottom: "3px double #d6d3d1", paddingBottom: "2rem", marginBottom: "2rem" },
                    name: { fontSize: "3rem", fontWeight: "700" },
                    contactRow: { justifyContent: "center" }
                }
            },
            summary: {
                styles: {
                    header: { textAlign: "center", textTransform: "uppercase", letterSpacing: "3px", fontSize: "1.2rem", fontWeight: "700", color: "#78716c", marginBottom: "1rem" }
                }
            },
            skills: {
                styles: {
                    header: { textAlign: "center", textTransform: "uppercase", letterSpacing: "3px", fontSize: "1.2rem", fontWeight: "700", color: "#78716c", marginBottom: "1rem" },
                    list: { variant: "text", separator: " • ", fontSize: "0.95rem" }
                }
            },
            experience: {
                styles: {
                    header: { textAlign: "center", textTransform: "uppercase", letterSpacing: "3px", fontSize: "1.2rem", fontWeight: "700", color: "#78716c", marginBottom: "1.5rem" },
                    item: { titleWeight: "700", subtitleWeight: "500", subtitleStyle: "italic" }
                }
            },
            education: {
                styles: {
                    header: { textAlign: "center", textTransform: "uppercase", letterSpacing: "3px", fontSize: "1.2rem", fontWeight: "700", color: "#78716c", marginBottom: "1.5rem" },
                    item: { titleWeight: "700", subtitleWeight: "500", subtitleStyle: "italic" }
                }
            },
            projects: {
                styles: {
                    header: { textAlign: "center", textTransform: "uppercase", letterSpacing: "3px", fontSize: "1.2rem", fontWeight: "700", color: "#78716c", marginBottom: "1.5rem" },
                    item: { titleWeight: "700" }
                }
            }
        }
    },

    // 14. BOLD CONTRAST
    bold: {
        id: "bold",
        layout: "grid",
        gridColumns: "1fr 2fr",
        globalStyles: { border: "8px solid black" },
        sectionOrder: ["header", "skills", "education", "experience", "projects"],
        gridSpans: {
            header: "1 / -1",
            skills: "1 / 2",
            education: "1 / 2",
            experience: "2 / 3",
            projects: "2 / 3"
        },
        sections: {
            header: {
                styles: {
                    container: { backgroundColor: "black", padding: "2rem", color: "white", margin: "-2.5rem -2.5rem 0 -2.5rem", marginBottom: "2rem" },
                    name: { color: "white", textTransform: "uppercase", fontWeight: "900", fontSize: "3rem" },
                    contactRow: { gap: "1rem" },
                    contactItem: { iconColor: "white", textColor: "white" }
                }
            },
            skills: {
                title: "SKILLS",
                styles: {
                    header: { backgroundColor: "black", color: "white", padding: "0.5rem 1rem", marginBottom: "1rem", fontWeight: "900", fontSize: "1.1rem" },
                    list: { variant: "bullet", fontSize: "0.9rem" }
                }
            },
            education: {
                title: "EDUCATION",
                styles: {
                    header: { backgroundColor: "black", color: "white", padding: "0.5rem 1rem", marginBottom: "1rem", fontWeight: "900", fontSize: "1.1rem" },
                    item: { titleWeight: "700", subtitleWeight: "600" }
                }
            },
            experience: {
                title: "EXPERIENCE",
                styles: {
                    header: { backgroundColor: "black", color: "white", padding: "0.5rem 1rem", marginBottom: "1rem", fontWeight: "900", fontSize: "1.1rem" },
                    item: { titleWeight: "700", subtitleWeight: "600" }
                }
            },
            projects: {
                title: "PROJECTS",
                styles: {
                    header: { backgroundColor: "black", color: "white", padding: "0.5rem 1rem", marginBottom: "1rem", fontWeight: "900", fontSize: "1.1rem" },
                    item: { titleWeight: "700" }
                }
            }
        }
    },

    // 15. SWISS GRID
    swiss: {
        id: "swiss",
        layout: "grid",
        globalStyles: { padding: "3rem" },
        gridColumns: "1fr 2fr",
        sectionOrder: ["header", "contact", "skills", "education", "experience", "projects"],
        gridSpans: {
            header: "1 / -1",
            contact: "1 / 2",
            skills: "1 / 2",
            education: "1 / 2",
            experience: "2 / 3",
            projects: "2 / 3"
        },
        sections: {
            header: {
                styles: {
                    container: { borderTop: "6px solid #dc2626", paddingTop: "2rem", marginTop: "-3rem", marginBottom: "2rem" },
                    name: { fontSize: "4rem", lineHeight: "1", fontWeight: "900" },
                    contactRow: { display: "none" }
                }
            },
            contact: {
                title: "CONTACT",
                styles: {
                    header: { color: "#dc2626", textTransform: "uppercase", fontSize: "0.9rem", fontWeight: "900", marginBottom: "1rem" },
                    contactItem: { fontSize: "0.875rem" }
                }
            },
            skills: {
                title: "SKILLS",
                styles: {
                    header: { color: "#dc2626", textTransform: "uppercase", fontSize: "0.9rem", fontWeight: "900", marginBottom: "1rem" },
                    list: { variant: "bullet", fontSize: "0.875rem" }
                }
            },
            education: {
                title: "EDUCATION",
                styles: {
                    header: { color: "#dc2626", textTransform: "uppercase", fontSize: "0.9rem", fontWeight: "900", marginBottom: "1rem" },
                    item: { titleWeight: "700", titleSize: "0.95rem", subtitleWeight: "500" }
                }
            },
            experience: {
                title: "EXPERIENCE",
                styles: {
                    header: { color: "#0f172a", textTransform: "uppercase", fontSize: "1.25rem", fontWeight: "900", marginBottom: "1.5rem" },
                    item: { titleWeight: "700", subtitleWeight: "600" }
                }
            },
            projects: {
                title: "PROJECTS",
                styles: {
                    header: { color: "#0f172a", textTransform: "uppercase", fontSize: "1.25rem", fontWeight: "900", marginBottom: "1.5rem" },
                    item: { titleWeight: "700" }
                }
            }
        }
    },

    // 16. MODERN CARDS
    cards: {
        id: "cards",
        layout: "single-column",
        colors: { background: "#f3f4f6" },
        sectionOrder: ["header", "summary", "skills", "experience", "education", "projects"],
        sections: {
            header: {
                styles: {
                    container: { backgroundColor: "white", padding: "2rem", borderRadius: "1rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", marginBottom: "1.5rem" },
                    name: { fontSize: "2.5rem", fontWeight: "700" }
                }
            },
            summary: {
                styles: {
                    container: { backgroundColor: "white", padding: "2rem", borderRadius: "1rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", marginBottom: "1.5rem" },
                    header: { fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem" }
                }
            },
            skills: {
                styles: {
                    container: { backgroundColor: "white", padding: "2rem", borderRadius: "1rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", marginBottom: "1.5rem" },
                    header: { fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem" },
                    list: { variant: "tags", tagBg: "#eff6ff", tagColor: "#1e3a8a", fontWeight: "600" }
                }
            },
            experience: {
                styles: {
                    container: { backgroundColor: "white", padding: "2rem", borderRadius: "1rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", marginBottom: "1.5rem" },
                    header: { fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem" },
                    item: { titleWeight: "700", subtitleWeight: "600" }
                }
            },
            education: {
                styles: {
                    container: { backgroundColor: "white", padding: "2rem", borderRadius: "1rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", marginBottom: "1.5rem" },
                    header: { fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem" },
                    item: { titleWeight: "700", subtitleWeight: "600" }
                }
            },
            projects: {
                styles: {
                    container: { backgroundColor: "white", padding: "2rem", borderRadius: "1rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", marginBottom: "1.5rem" },
                    header: { fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem" },
                    item: { titleWeight: "700" }
                }
            }
        }
    },

    // 17. ATS CLASSIC
    atsclassic: {
        id: "atsclassic",
        layout: "single-column",
        fontId: "sans",
        sectionOrder: ["header", "summary", "education", "skills", "experience", "projects"],
        sections: {
            header: {
                styles: {
                    container: { textAlign: "center", borderBottom: "1px solid black", paddingBottom: "1rem", marginBottom: "1.5rem" },
                    name: { fontSize: "1.75rem", fontWeight: "700", textTransform: "uppercase" },
                    contactRow: { justifyContent: "center", gap: "1rem" }
                }
            },
            summary: {
                styles: {
                    header: { textTransform: "uppercase", fontSize: "1rem", fontWeight: "700", borderBottom: "1px solid black", paddingBottom: "0.25rem", marginBottom: "1rem" }
                }
            },
            experience: {
                styles: {
                    header: { textTransform: "uppercase", fontSize: "1rem", fontWeight: "700", borderBottom: "1px solid black", paddingBottom: "0.25rem", marginBottom: "1rem" },
                    item: { titleWeight: "700", subtitleWeight: "500" }
                }
            },
            skills: {
                styles: {
                    header: { textTransform: "uppercase", fontSize: "1rem", fontWeight: "700", borderBottom: "1px solid black", paddingBottom: "0.25rem", marginBottom: "1rem" },
                    list: { variant: "text", separator: ", " }
                }
            },
            education: {
                styles: {
                    header: { textTransform: "uppercase", fontSize: "1rem", fontWeight: "700", borderBottom: "1px solid black", paddingBottom: "0.25rem", marginBottom: "1rem" },
                    item: { titleWeight: "700", subtitleWeight: "500" }
                }
            },
            projects: {
                styles: {
                    header: { textTransform: "uppercase", fontSize: "1rem", fontWeight: "700", borderBottom: "1px solid black", paddingBottom: "0.25rem", marginBottom: "1rem" },
                    item: { titleWeight: "700" }
                }
            }
        }
    },

    // 18. ATS MODERN
    atsmodern: {
        id: "atsmodern",
        layout: "single-column",
        fontId: "sans",
        sectionOrder: ["header", "summary", "skills", "experience", "education", "projects"],
        sections: {
            header: {
                styles: {
                    container: { borderBottom: "2px solid #e2e8f0", paddingBottom: "1.5rem", marginBottom: "2rem" },
                    name: { color: "#334155", fontSize: "2.5rem", fontWeight: "700" },
                    contactRow: { gap: "1rem" }
                }
            },
            summary: {
                styles: {
                    header: { color: "#334155", fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem" }
                }
            },
            skills: {
                styles: {
                    header: { color: "#334155", fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem" },
                    list: { variant: "tags", tagBg: "#f1f5f9", tagColor: "#475569", fontWeight: "600" }
                }
            },
            experience: {
                styles: {
                    header: { color: "#334155", fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem" },
                    item: { titleWeight: "700", subtitleWeight: "600" }
                }
            },
            education: {
                styles: {
                    header: { color: "#334155", fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem" },
                    item: { titleWeight: "700", subtitleWeight: "600" }
                }
            },
            projects: {
                styles: {
                    header: { color: "#334155", fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem" },
                    item: { titleWeight: "700" }
                }
            }
        }
    }
};
