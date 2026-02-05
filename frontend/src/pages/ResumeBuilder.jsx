import React, { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer, LayoutTemplate, PenTool, Check } from "lucide-react";
import { TemplateModern, TemplateProfessional, TemplateMinimalist } from "../components/ResumeTemplates";
import { colorThemes, fontThemes, getThemeStyle, getFontStyle } from "../utils/templateThemes";

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

    const [selectedTemplate, setSelectedTemplate] = useState("modern");

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

    const templates = [
        { id: "modern", name: "Modern Sidebar", component: TemplateModern },
        { id: "professional", name: "Professional Classic", component: TemplateProfessional },
        { id: "minimalist", name: "Clean Minimalist", component: TemplateMinimalist },
    ];

    const [activeTheme, setActiveTheme] = useState(colorThemes[0].id);
    const [activeFont, setActiveFont] = useState(fontThemes[0].id);

    const currentTheme = getThemeStyle(activeTheme);
    const currentFont = getFontStyle(activeFont);
    const SelectedTemplateComponent = templates.find(t => t.id === selectedTemplate)?.component || TemplateModern;

    return (
        <div className="container mx-auto p-4 lg:p-8 max-w-[1600px]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Editor Side (Left) */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white">
                            <PenTool className="w-5 h-5 text-blue-600" />
                            <h2 className="text-xl font-bold">Editor</h2>
                        </div>

                        {/* Layout Selector */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">1. Choose Layout</label>
                            <div className="grid grid-cols-3 gap-3">
                                {templates.map((template) => (
                                    <button
                                        key={template.id}
                                        onClick={() => setSelectedTemplate(template.id)}
                                        className={`group relative p-2 rounded-lg border-2 transition-all text-sm font-medium ${selectedTemplate === template.id
                                                ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                                : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:text-slate-300"
                                            }`}
                                    >
                                        {template.name}
                                        {selectedTemplate === template.id && (
                                            <div className="absolute top-1 right-1 text-blue-600 dark:text-blue-400">
                                                <Check className="w-3 h-3" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Style Selector */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">2. Choose Style</label>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs text-slate-500 mb-2 block uppercase tracking-wider">Color Theme</span>
                                    <div className="flex flex-wrap gap-2">
                                        {colorThemes.map((t) => (
                                            <button
                                                key={t.id}
                                                onClick={() => setActiveTheme(t.id)}
                                                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${activeTheme === t.id ? 'ring-2 ring-offset-2 ring-blue-500 border-white' : 'border-slate-200'}`}
                                                style={{ backgroundColor: t.primary }}
                                                title={t.name}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-xs text-slate-500 mb-2 block uppercase tracking-wider">Typography</span>
                                    <div className="flex flex-wrap gap-2">
                                        {fontThemes.map((f) => (
                                            <button
                                                key={f.id}
                                                onClick={() => setActiveFont(f.id)}
                                                className={`px-3 py-1 rounded text-xs border transition-colors ${activeFont === f.id
                                                        ? "bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900"
                                                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600"
                                                    }`}
                                            >
                                                {f.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className="my-6 border-slate-100 dark:border-slate-700" />

                        {/* Personal Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Personal Info</h3>
                            <input
                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                                name="fullName"
                                placeholder="Full Name"
                                value={formData.fullName}
                                onChange={handleChange}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                <input
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                                    name="phone"
                                    placeholder="Phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                            <textarea
                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none resize-none"
                                name="summary"
                                placeholder="Professional Summary"
                                rows="4"
                                value={formData.summary}
                                onChange={handleChange}
                            />
                        </div>

                        <hr className="my-6 border-slate-100 dark:border-slate-700" />

                        {/* Experience */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Experience</h3>
                                <button
                                    onClick={() => addItem("experience", { title: "", company: "", date: "", desc: "" })}
                                    className="text-xs font-medium bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
                                >
                                    + Add Role
                                </button>
                            </div>
                            {formData.experience.map((exp, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 relative group">
                                    <button onClick={() => removeItem("experience", idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity">Remove</button>
                                    <input
                                        className="w-full mb-3 p-2 bg-transparent border-b border-dashed border-slate-300 dark:border-slate-600 focus:border-blue-500 outline-none font-medium"
                                        placeholder="Job Title"
                                        value={exp.title}
                                        onChange={(e) => handleArrayChange(idx, "experience", "title", e.target.value)}
                                    />
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <input
                                            className="p-2 bg-transparent border-b border-dashed border-slate-300 dark:border-slate-600 focus:border-blue-500 outline-none text-sm"
                                            placeholder="Company"
                                            value={exp.company}
                                            onChange={(e) => handleArrayChange(idx, "experience", "company", e.target.value)}
                                        />
                                        <input
                                            className="p-2 bg-transparent border-b border-dashed border-slate-300 dark:border-slate-600 focus:border-blue-500 outline-none text-sm text-right"
                                            placeholder="Date Range"
                                            value={exp.date}
                                            onChange={(e) => handleArrayChange(idx, "experience", "date", e.target.value)}
                                        />
                                    </div>
                                    <textarea
                                        className="w-full p-2 bg-transparent border rounded border-slate-200 dark:border-slate-700 focus:border-blue-500 outline-none text-sm resize-none"
                                        placeholder="Description of achievements..."
                                        rows="3"
                                        value={exp.desc}
                                        onChange={(e) => handleArrayChange(idx, "experience", "desc", e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>

                        <hr className="my-6 border-slate-100 dark:border-slate-700" />

                        {/* Education */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Education</h3>
                                <button
                                    onClick={() => addItem("education", { degree: "", school: "", year: "" })}
                                    className="text-xs font-medium bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
                                >
                                    + Add Education
                                </button>
                            </div>
                            {formData.education.map((edu, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 relative group">
                                    <button onClick={() => removeItem("education", idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity">Remove</button>
                                    <input
                                        className="w-full mb-2 p-2 bg-transparent border-b border-dashed border-slate-300 dark:border-slate-600 focus:border-blue-500 outline-none font-medium"
                                        placeholder="Degree"
                                        value={edu.degree}
                                        onChange={(e) => handleArrayChange(idx, "education", "degree", e.target.value)}
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            className="p-2 bg-transparent border-b border-dashed border-slate-300 dark:border-slate-600 focus:border-blue-500 outline-none text-sm"
                                            placeholder="School"
                                            value={edu.school}
                                            onChange={(e) => handleArrayChange(idx, "education", "school", e.target.value)}
                                        />
                                        <input
                                            className="p-2 bg-transparent border-b border-dashed border-slate-300 dark:border-slate-600 focus:border-blue-500 outline-none text-sm text-right"
                                            placeholder="Year"
                                            value={edu.year}
                                            onChange={(e) => handleArrayChange(idx, "education", "year", e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <hr className="my-6 border-slate-100 dark:border-slate-700" />

                        {/* Skills */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Skills</h3>
                            <textarea
                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none resize-none"
                                name="skills"
                                placeholder="Comma separated skills (e.g. Python, React, Leadership)"
                                rows="3"
                                value={formData.skills}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Preview Side (Right) */}
                <div className="lg:col-span-7 xl:col-span-8">
                    <div className="sticky top-6">
                        <div className="flex flex-wrap justify-between items-center mb-4 bg-slate-900 text-white p-4 rounded-xl shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/10 rounded-lg">
                                    <LayoutTemplate className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="font-bold">Live Preview</h2>
                                    <p className="text-xs text-slate-400">
                                        {templates.find(t => t.id === selectedTemplate)?.name} • {colorThemes.find(t => t.id === activeTheme)?.name}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg shadow-lg shadow-blue-600/20 transition-all active:scale-95 font-medium"
                            >
                                <Printer size={18} /> Download PDF
                            </button>
                        </div>

                        <div className="overflow-hidden rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 bg-slate-500/10">
                            {/* Zoom/Scale Container */}
                            <div className="overflow-auto max-h-[calc(100vh-140px)] custom-scrollbar">
                                <div className="min-w-[800px] flex justify-center p-8">
                                    <div ref={componentRef} className="shadow-2xl transition-all origin-top w-full max-w-[210mm]">
                                        <SelectedTemplateComponent
                                            data={formData}
                                            theme={currentTheme}
                                            font={currentFont}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent; 
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1; 
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8; 
                }
            `}</style>
        </div>
    );
}
