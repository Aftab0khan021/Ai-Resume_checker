import React, { useState, useRef, useMemo } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer, PenTool, Layout, X, Eye, Palette, ChevronLeft, Check } from "lucide-react";
import { TemplateModern, TemplateProfessional, TemplateMinimalist, TemplateCreative, TemplateTimeline } from "../components/ResumeTemplates";
import { colorThemes, fontThemes, layoutThemes, getThemeStyle, getFontStyle } from "../utils/templateThemes";

// Generate presets locally to ensure availability
const generateAllPresets = () => {
    const presets = [];
    let count = 0;
    layoutThemes.forEach(layout => {
        colorThemes.forEach(color => {
            fontThemes.forEach(font => {
                count++;
                presets.push({
                    id: `preset-${count}`,
                    name: `${color.name} ${layout.name}`,
                    layoutId: layout.id,
                    themeId: color.id,
                    fontId: font.id,
                    previewColor: color.primary
                });
            });
        });
    });
    return presets;
};

const allPresets = generateAllPresets();

export default function ResumeBuilder() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        summary: "",
        experience: [],
        education: [],
        skills: ""
    });

    // View State
    const [viewMode, setViewMode] = useState("edit"); // 'edit', 'preview', 'gallery'
    const [showGallery, setShowGallery] = useState(false);

    // Selection State
    const [selectedLayout, setSelectedLayout] = useState("modern");
    const [selectedTheme, setSelectedTheme] = useState("slate");
    const [selectedFont, setSelectedFont] = useState("sans");

    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `${formData.fullName || "Resume"}_Resume`,
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleArrayChange = (index, field, key, value) => {
        const newArray = [...formData[field]];
        newArray[index][key] = value;
        setFormData({ ...formData, [field]: newArray });
    };

    const addItem = (field, template) => {
        setFormData({ ...formData, [field]: [...formData[field], template] });
    };

    const removeItem = (field, index) => {
        const newArray = [...formData[field]];
        newArray.splice(index, 1);
        setFormData({ ...formData, [field]: newArray });
    };

    // Component Map
    const templates = {
        modern: TemplateModern,
        professional: TemplateProfessional,
        minimalist: TemplateMinimalist,
        creative: TemplateCreative,
        timeline: TemplateTimeline
    };

    const SelectedTemplateComponent = templates[selectedLayout] || TemplateModern;
    const currentThemeStyle = getThemeStyle(selectedTheme);
    const currentFontStyle = getFontStyle(selectedFont);

    // Filter Logic for Gallery
    const [filterCategory, setFilterCategory] = useState("all");
    const filteredPresets = useMemo(() => {
        if (filterCategory === "all") return allPresets;
        return allPresets.filter(p => p.layoutId === filterCategory || p.themeId === filterCategory);
    }, [filterCategory]);

    const handlePresetSelect = (preset) => {
        setSelectedLayout(preset.layoutId);
        setSelectedTheme(preset.themeId);
        setSelectedFont(preset.fontId);
        setShowGallery(false);
    };

    if (viewMode === "preview") {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center py-8">
                <div className="w-full max-w-6xl px-4 flex justify-between items-center mb-6">
                    <button
                        onClick={() => setViewMode("edit")}
                        className="flex items-center gap-2 text-white hover:text-blue-300 transition-colors"
                    >
                        <ChevronLeft /> Back to Editor
                    </button>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowGallery(true)}
                            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <Palette size={18} /> Change Template
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-lg transition-all font-bold"
                        >
                            <Printer size={18} /> Download PDF
                        </button>
                    </div>
                </div>

                <div className="bg-white p-1 rounded overflow-auto max-h-[85vh] shadow-2xl">
                    <div ref={componentRef} className="min-w-[210mm] min-h-[297mm]">
                        <SelectedTemplateComponent
                            data={formData}
                            theme={currentThemeStyle}
                            font={currentFontStyle}
                        />
                    </div>
                </div>

                {/* Gallery Modal Overlay */}
                {showGallery && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
                            <div className="p-6 border-b flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-slate-900">Choose a Template</h2>
                                <button onClick={() => setShowGallery(false)} className="text-slate-500 hover:text-slate-800"><X /></button>
                            </div>
                            <div className="p-4 bg-slate-50 border-b flex gap-2 overflow-x-auto">
                                <button onClick={() => setFilterCategory("all")} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterCategory === "all" ? "bg-slate-900 text-white" : "bg-white text-slate-600 border"}`}>All</button>
                                <button onClick={() => setFilterCategory("modern")} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterCategory === "modern" ? "bg-slate-900 text-white" : "bg-white text-slate-600 border"}`}>Modern</button>
                                <button onClick={() => setFilterCategory("professional")} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterCategory === "professional" ? "bg-slate-900 text-white" : "bg-white text-slate-600 border"}`}>Professional</button>
                                <button onClick={() => setFilterCategory("minimalist")} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterCategory === "minimalist" ? "bg-slate-900 text-white" : "bg-white text-slate-600 border"}`}>Minimalist</button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {filteredPresets.map(preset => (
                                    <button
                                        key={preset.id}
                                        onClick={() => handlePresetSelect(preset)}
                                        className="group text-left border rounded-lg overflow-hidden hover:ring-4 ring-blue-500/20 transition-all hover:shadow-xl"
                                    >
                                        <div className="h-40 bg-slate-100 relative overflow-hidden">
                                            <div className="absolute inset-0 flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                                                <div className="w-20 h-28 bg-white shadow-sm scale-75 border-t-8" style={{ borderTopColor: preset.previewColor }}></div>
                                            </div>
                                            <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/10 to-transparent"></div>
                                        </div>
                                        <div className="p-3 bg-white">
                                            <h3 className="font-bold text-slate-900 text-sm">{preset.name}</h3>
                                            <p className="text-xs text-slate-500 capitalize">{preset.layoutId} • {preset.fontId}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 lg:p-8 max-w-4xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Resume Editor</h1>
                    <p className="text-slate-500">Craft your professional story.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowGallery(true)}
                        className="flex items-center gap-2 bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <Layout size={18} /> Templates
                    </button>
                    <button
                        onClick={() => setViewMode("preview")}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
                    >
                        <Eye size={18} /> Preview & Download
                    </button>
                </div>
            </div>

            {/* Gallery Modal (Edit Mode) */}
            {showGallery && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Template Gallery</h2>
                                <p className="text-slate-500 text-sm">Select from over {allPresets.length} unique styles</p>
                            </div>
                            <button onClick={() => setShowGallery(false)} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
                        </div>
                        <div className="p-4 bg-slate-50 border-b flex gap-2 overflow-x-auto">
                            <button onClick={() => setFilterCategory("all")} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterCategory === "all" ? "bg-slate-900 text-white" : "bg-white text-slate-600 border"}`}>All</button>
                            <button onClick={() => setFilterCategory("modern")} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterCategory === "modern" ? "bg-slate-900 text-white" : "bg-white text-slate-600 border"}`}>Modern</button>
                            <button onClick={() => setFilterCategory("professional")} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterCategory === "professional" ? "bg-slate-900 text-white" : "bg-white text-slate-600 border"}`}>Professional</button>
                            <button onClick={() => setFilterCategory("minimalist")} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterCategory === "minimalist" ? "bg-slate-900 text-white" : "bg-white text-slate-600 border"}`}>Minimalist</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredPresets.map(preset => (
                                <button
                                    key={preset.id}
                                    onClick={() => handlePresetSelect(preset)}
                                    className="group text-left border-2 border-slate-200 rounded-xl overflow-hidden hover:border-blue-500 hover:shadow-xl transition-all bg-white flex flex-col h-full"
                                >
                                    <div className="h-48 bg-slate-100 flex items-center justify-center p-4 relative group-hover:bg-slate-200 transition-colors">
                                        {/* Dynamic Mini Preview Skeleton */}
                                        <div className="w-24 h-32 bg-white shadow-lg border border-slate-300 flex flex-col transform group-hover:scale-105 transition-transform duration-300 overflow-hidden">

                                            {/* Modern Sidebar Layout */}
                                            {preset.layoutId === 'modern' && (
                                                <div className="flex h-full">
                                                    <div className="w-1/3 h-full p-1 flex flex-col gap-1" style={{ backgroundColor: preset.previewColor }}>
                                                        <div className="w-full h-1/4 bg-white/20 rounded-sm"></div>
                                                        <div className="w-full h-1 bg-white/20 rounded-sm mt-auto"></div>
                                                    </div>
                                                    <div className="w-2/3 p-1 flex flex-col gap-1">
                                                        <div className="h-2 w-full bg-slate-200 rounded-sm mb-1"></div>
                                                        <div className="h-1 w-full bg-slate-100 rounded-sm"></div>
                                                        <div className="h-1 w-3/4 bg-slate-100 rounded-sm"></div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Professional Classic Layout */}
                                            {preset.layoutId === 'professional' && (
                                                <div className="flex flex-col h-full p-1.5 items-center">
                                                    <div className="h-3 w-3/4 mb-1" style={{ backgroundColor: preset.previewColor }}></div>
                                                    <div className="h-px w-full bg-slate-200 mb-2"></div>
                                                    <div className="w-full flex flex-col gap-1">
                                                        <div className="h-1.5 w-1/3 bg-slate-200 rounded-sm mb-0.5" style={{ backgroundColor: preset.previewColor, opacity: 0.5 }}></div>
                                                        <div className="h-1 w-full bg-slate-100 rounded-sm"></div>
                                                        <div className="h-1 w-full bg-slate-100 rounded-sm"></div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Clean Minimalist Layout */}
                                            {preset.layoutId === 'minimalist' && (
                                                <div className="flex flex-col h-full p-2">
                                                    <div className="h-4 w-1/2 mb-3" style={{ color: preset.previewColor }}>
                                                        <div className="h-full w-full bg-current opacity-80 rounded-sm"></div>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-1 h-full">
                                                        <div className="col-span-1 h-3/4 bg-slate-50 rounded-sm"></div>
                                                        <div className="col-span-2 flex flex-col gap-1">
                                                            <div className="h-1 w-full bg-slate-100 rounded-sm"></div>
                                                            <div className="h-1 w-full bg-slate-100 rounded-sm"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Creative Left Layout */}
                                            {preset.layoutId === 'creative' && (
                                                <div className="flex h-full">
                                                    <div className="w-1/3 h-full flex flex-col items-center pt-2 gap-1" style={{ backgroundColor: preset.previewColor }}>
                                                        <div className="w-6 h-6 rounded-full bg-white/30"></div>
                                                        <div className="w-full h-px bg-white/10 mt-1"></div>
                                                    </div>
                                                    <div className="w-2/3 flex flex-col p-1 gap-1">
                                                        <div className="h-4 w-full opacity-20" style={{ backgroundColor: preset.previewColor }}></div>
                                                        <div className="h-1 w-full bg-slate-100 rounded-sm mt-2"></div>
                                                        <div className="h-1 w-full bg-slate-100 rounded-sm"></div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Timeline Vertical Layout */}
                                            {preset.layoutId === 'timeline' && (
                                                <div className="flex flex-col h-full p-1 relative overflow-hidden">
                                                    <div className="h-2 w-full bg-slate-100 mb-2 rounded-sm" style={{ borderTop: `2px solid ${preset.previewColor}` }}></div>
                                                    <div className="h-full w-px bg-slate-200 absolute left-1/2 top-4"></div>
                                                    <div className="grid grid-cols-2 gap-2 h-full relative z-10 w-full">
                                                        <div className="text-right pt-2"><div className="h-1.5 w-full bg-slate-200 rounded-sm"></div></div>
                                                        <div className="pt-5"><div className="h-1.5 w-full bg-slate-50 rounded-sm"></div></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Selection Indicator */}
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="bg-blue-600 text-white p-1 rounded-full shadow-lg">
                                                <Check size={12} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-white border-t border-slate-100 flex-1">
                                        <h3 className="font-bold text-slate-900 text-sm mb-1 leading-tight">{preset.name}</h3>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{preset.layoutId}</span>
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{preset.fontId}</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-8">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                    <PenTool className="text-blue-600" />
                    <h2 className="text-xl font-bold">Edit Details</h2>
                </div>

                {/* Personal Info */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase text-slate-400">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input className="input-field p-3 border rounded-lg bg-slate-50" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} />
                        <input className="input-field p-3 border rounded-lg bg-slate-50" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
                        <input className="input-field p-3 border rounded-lg bg-slate-50" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
                    </div>
                    <textarea className="input-field w-full p-3 border rounded-lg bg-slate-50" name="summary" placeholder="Professional Summary" rows="3" value={formData.summary} onChange={handleChange} />
                </div>

                {/* Experience */}
                <div className="space-y-4">
                    <div className="flex justify-between">
                        <h3 className="text-sm font-bold uppercase text-slate-400">Experience</h3>
                        <button onClick={() => addItem("experience", { title: "", company: "", date: "", desc: "" })} className="text-blue-600 text-sm font-bold">+ Add Job</button>
                    </div>
                    {formData.experience.map((exp, idx) => (
                        <div key={idx} className="p-4 border rounded-lg bg-slate-50 relative">
                            <button onClick={() => removeItem("experience", idx)} className="absolute top-2 right-2 text-red-500 text-xs">Remove</button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                <input placeholder="Job Title" className="p-2 border rounded" value={exp.title} onChange={(e) => handleArrayChange(idx, "experience", "title", e.target.value)} />
                                <input placeholder="Company" className="p-2 border rounded" value={exp.company} onChange={(e) => handleArrayChange(idx, "experience", "company", e.target.value)} />
                                <input placeholder="Date Range" className="p-2 border rounded" value={exp.date} onChange={(e) => handleArrayChange(idx, "experience", "date", e.target.value)} />
                            </div>
                            <textarea placeholder="Description" className="w-full p-2 border rounded" rows="3" value={exp.desc} onChange={(e) => handleArrayChange(idx, "experience", "desc", e.target.value)} />
                        </div>
                    ))}
                </div>

                {/* Education */}
                <div className="space-y-4">
                    <div className="flex justify-between">
                        <h3 className="text-sm font-bold uppercase text-slate-400">Education</h3>
                        <button onClick={() => addItem("education", { degree: "", school: "", year: "" })} className="text-blue-600 text-sm font-bold">+ Add School</button>
                    </div>
                    {formData.education.map((edu, idx) => (
                        <div key={idx} className="p-4 border rounded-lg bg-slate-50 relative">
                            <button onClick={() => removeItem("education", idx)} className="absolute top-2 right-2 text-red-500 text-xs">Remove</button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                <input placeholder="Degree" className="p-2 border rounded" value={edu.degree} onChange={(e) => handleArrayChange(idx, "education", "degree", e.target.value)} />
                                <input placeholder="School" className="p-2 border rounded" value={edu.school} onChange={(e) => handleArrayChange(idx, "education", "school", e.target.value)} />
                                <input placeholder="Year" className="p-2 border rounded" value={edu.year} onChange={(e) => handleArrayChange(idx, "education", "year", e.target.value)} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Skills */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase text-slate-400">Skills</h3>
                    <textarea className="w-full p-3 border rounded-lg bg-slate-50" name="skills" placeholder="Skills (comma separated)" rows="2" value={formData.skills} onChange={handleChange} />
                </div>
            </div>
        </div>
    );
}
