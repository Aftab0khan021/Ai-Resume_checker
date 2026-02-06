// ==========================================
// TEMPLATE CONFIGURATIONS
// ==========================================

export const templateConfigs = {
    // 1. MODERN (Sidebar Left)
    modern: {
        id: "modern",
        layout: "sidebar-left",
        sidebarWidth: "35%",
        colors: { sidebarBg: "#2563eb", text: "#1e293b" },
        sidebarOrder: ["header", "skills", "contact"],
        mainOrder: ["summary", "experience", "education", "projects"],
        sections: {
            header: {
                styles: {
                    name: { fontSize: "2.5rem", color: "white", marginBottom: "0.5rem" },
                    contactItem: { iconColor: "white", textColor: "white", marginBottom: "0.5rem" }
                }
            },
            skills: {
                title: "Expertise",
                styles: {
                    header: { color: "white", borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: "0.5rem" },
                    list: { color: "white", variant: "bullet" }
                }
            },
            experience: {
                styles: {
                    header: { color: "#2563eb", fontSize: "1.5rem", borderBottom: "2px solid #2563eb", paddingBottom: "0.5rem" },
                    item: { titleColor: "#1e293b", titleSize: "1.1rem" }
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
        sectionOrder: ["header", "summary", "experience", "education", "skills"],
        sections: {
            header: {
                styles: {
                    container: { textAlign: "center", borderBottom: "1px solid #cbd5e1", paddingBottom: "2rem", marginBottom: "2rem" },
                    name: { fontSize: "3rem", textTransform: "uppercase", letterSpacing: "2px" },
                    contactRow: { justifyContent: "center", gap: "1.5rem" }
                }
            },
            experience: {
                styles: {
                    header: { textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem", fontSize: "1.1rem" }
                }
            }
        }
    },

    // 3. MINIMALIST (Clean Whitespace)
    minimalist: {
        id: "minimalist",
        layout: "single-column",
        fontId: "mono",
        sectionOrder: ["header", "skills", "experience", "education"],
        sections: {
            header: {
                styles: {
                    name: { fontSize: "2rem", fontWeight: "normal" }
                }
            },
            experience: {
                styles: {
                    item: { marginBottom: "2rem" }
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
        mainOrder: ["summary", "experience", "education"],
        sections: {
            header: { styles: { name: { fontSize: "2rem", color: "white" }, contactItem: { iconColor: "white", textColor: "white" } } },
            experience: { styles: { header: { color: "#7c3aed", fontSize: "1.8rem", fontWeight: "900" } } }
        }
    },

    // 5. TIMELINE
    timeline: {
        id: "timeline",
        layout: "single-column",
        sectionOrder: ["header", "experience", "education", "skills"],
        sections: {
            experience: {
                styles: {
                    container: { borderLeft: "2px solid #e2e8f0", paddingLeft: "1.5rem", marginLeft: "1rem" },
                    item: { marginBottom: "2rem", position: "relative" }
                }
            }
        }
    },

    // 6. TWO COLUMN
    twocolumn: {
        id: "twocolumn",
        layout: "grid",
        gridColumns: "1fr 1fr",
        sectionOrder: ["header", "summary", "experience", "education", "skills"], // header handled specially
        gridSpans: { header: "1 / -1", summary: "1 / -1", experience: "1 / 2", education: "2 / 3", skills: "2 / 3" }
    },

    // 7. COMPACT (ATS Friendly)
    compact: {
        id: "compact",
        layout: "single-column",
        pagePadding: "1.5rem",
        sectionOrder: ["header", "skills", "experience", "education"],
        sections: {
            header: { styles: { name: { fontSize: "1.5rem" }, container: { borderBottom: "2px solid #334155", paddingBottom: "1rem" } } },
            skills: { styles: { list: { variant: "text", fontSize: "0.8rem" } } },
            experience: { styles: { item: { marginBottom: "1rem" }, descSize: "0.85rem" } }
        }
    },

    // 8. GRID MAGAZINE
    grid: {
        id: "grid",
        layout: "grid",
        gridColumns: "1fr 2fr",
        sectionOrder: ["header", "skills", "experience", "education"],
        gridSpans: { header: "1 / -1", experience: "2 / 3", education: "1 / 2", skills: "1 / 2" }
    },

    // 9. HEADER DOMINANT
    headerfocused: {
        id: "headerfocused",
        layout: "single-column",
        colors: { primary: "white", background: "#f8fafc" },
        sectionOrder: ["header", "experience", "skills"],
        sections: {
            header: {
                styles: {
                    container: { backgroundColor: "#1e3a8a", padding: "3rem", marginBottom: "2rem", margin: "-2.5rem -2.5rem 2rem -2.5rem" },
                    name: { fontSize: "3.5rem", color: "white" },
                    contactItem: { textColor: "rgba(255,255,255,0.8)", iconColor: "white" }
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
        mainOrder: ["header", "summary", "experience"],
        sidebarOrder: ["contact", "skills", "education", "projects"],
        sections: {
            header: { styles: { name: { fontSize: "3rem", fontWeight: "900" } } }
        }
    },

    // 11. HORIZONTAL
    horizontal: {
        id: "horizontal",
        layout: "single-column",
        sectionOrder: ["header", "skills", "experience", "education"],
        sections: {
            skills: { styles: { list: { variant: "tags" }, container: { backgroundColor: "#f8fafc", padding: "1.5rem", borderRadius: "8px" } } }
        }
    },

    // 12. TECH MINIMALIST
    tech: {
        id: "tech",
        layout: "single-column",
        fontId: "mono",
        colors: { text: "#334155" },
        sectionOrder: ["header", "skills", "experience", "projects", "education"],
        sections: {
            header: { styles: { name: { prefix: "> ", suffix: "_", fontSize: "2rem" }, container: { borderBottom: "4px solid #334155", paddingBottom: "1rem" } } },
            skills: { title: "SKILLS.json", styles: { container: { backgroundColor: "#f1f5f9", padding: "1rem", fontFamily: "monospace" } } },
            experience: { title: "function Experience() {", styles: { header: { color: "#2563eb" } } }
        }
    },

    // 13. EXECUTIVE SERIF
    executive: {
        id: "executive",
        layout: "single-column",
        fontId: "serif",
        colors: { background: "#fdfbf7", text: "#1c1917" },
        sectionOrder: ["header", "summary", "experience", "education"],
        sections: {
            header: { styles: { container: { textAlign: "center", borderBottom: "3px double #d6d3d1", paddingBottom: "2rem" }, name: { fontSize: "3rem" } } },
            experience: { styles: { header: { textAlign: "center", textTransform: "uppercase", letterSpacing: "3px", fontSize: "1.2rem", color: "#78716c" } } }
        }
    },

    // 14. BOLD CONTRAST
    bold: {
        id: "bold",
        layout: "grid",
        gridColumns: "30% 70%",
        globalStyles: { border: "8px solid black" },
        sectionOrder: ["header", "skills", "education", "experience"],
        gridSpans: { header: "1 / -1", skills: "1 / 2", education: "1 / 2", experience: "2 / 3" },
        sections: {
            header: { styles: { container: { backgroundColor: "black", padding: "2rem", color: "white" }, name: { color: "white", textTransform: "uppercase", fontWeight: "900" } } },
            skills: { styles: { header: { backgroundColor: "black", color: "white", padding: "0.25rem 0.5rem", display: "inline-block" } } }
        }
    },

    // 15. SWISS GRID
    swiss: {
        id: "swiss",
        layout: "grid",
        globalStyles: { padding: "3rem" },
        gridColumns: "1fr 2fr",
        sectionOrder: ["header", "contact", "education", "experience", "summary"],
        gridSpans: { header: "1 / -1", contact: "1 / 2", education: "1 / 2", experience: "2 / 3", summary: "2 / 3" },
        sections: {
            header: { styles: { container: { borderTop: "6px solid #dc2626", paddingTop: "2rem" }, name: { fontSize: "4rem", lineHeight: "1" } } },
            contact: { styles: { header: { color: "#dc2626", textTransform: "uppercase", fontSize: "0.9rem" } } }
        }
    },

    // 16. MODERN CARDS
    cards: {
        id: "cards",
        layout: "single-column",
        colors: { background: "#f3f4f6" },
        sectionOrder: ["header", "skills", "experience", "education"],
        sections: {
            header: { styles: { container: { backgroundColor: "white", padding: "2rem", borderRadius: "1rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" } } },
            experience: { styles: { container: { backgroundColor: "white", padding: "2rem", borderRadius: "1rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" } } },
            skills: { styles: { container: { backgroundColor: "white", padding: "2rem", borderRadius: "1rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }, list: { variant: "tags", tagBg: "#eff6ff", tagColor: "#1e3a8a" } } }
        }
    },

    // 17. ATS CLASSIC
    atsclassic: {
        id: "atsclassic",
        layout: "single-column",
        fontId: "sans",
        sectionOrder: ["header", "education", "skills", "experience", "projects"],
        sections: {
            header: { styles: { container: { textAlign: "center", borderBottom: "1px solid black" } } },
            experience: { styles: { header: { textTransform: "uppercase", fontSize: "1rem", borderBottom: "1px solid black" } } }
        }
    },

    // 18. ATS MODERN
    atsmodern: {
        id: "atsmodern",
        layout: "single-column",
        fontId: "sans",
        sectionOrder: ["header", "summary", "skills", "experience", "education"],
        sections: {
            header: { styles: { name: { color: "#334155" }, container: { borderBottom: "2px solid #e2e8f0" } } },
            skills: { styles: { header: { color: "#334155" } } }
        }
    }
};
