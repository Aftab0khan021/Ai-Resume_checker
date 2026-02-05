import React, { useState, useRef, useMemo } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer, PenTool, Layout, X, Eye, Palette, ChevronLeft } from "lucide-react";
import { TemplateModern, TemplateProfessional, TemplateMinimalist } from "../components/ResumeTemplates";
import { getThemeStyle, getFontStyle } from "../utils/templateThemes";
import { allPresets } from "../utils/templatePresets";

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
        creative: TemplateModern, // Fallbacks for now
        timeline: TemplateProfessional // Fallbacks for now
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
                                    className="group text-left border rounded-lg overflow-hidden hover:ring-4 ring-blue-500/20 transition-all hover:shadow-xl bg-white"
                                >
                                    <div className="h-40 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                                        {/* Abstract Mini Preview */}
                                        <div className="w-24 h-32 bg-white shadow-sm border-[0.5px] border-slate-200 p-2 flex flex-col gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity transform group-hover:scale-105 duration-300">
                                            <div className="h-3 w-full bg-slate-200 rounded-sm" style={{ backgroundColor: preset.previewColor }}></div>
                                            <div className="h-1.5 w-2/3 bg-slate-100 rounded-sm"></div>
                                            <div className="h-1.5 w-full bg-slate-100 rounded-sm"></div>
                                            <div className="mt-2 flex gap-1">
                                                <div className="w-1/3 h-16 bg-slate-50 rounded-sm"></div>
                                                <div className="w-2/3 h-16 bg-slate-50 rounded-sm"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3 border-t">
                                        <h3 className="font-bold text-slate-900 text-sm truncate">{preset.name}</h3>
                                        <p className="text-xs text-slate-500 flex justify-between mt-1">
                                            <span className="capitalize">{preset.layoutId}</span>
                                            <span className="opacity-50">{preset.fontId}</span>
                                        </p>
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
