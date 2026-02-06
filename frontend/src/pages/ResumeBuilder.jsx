import React, { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer, Layout, X, Eye, ChevronLeft, Check } from "lucide-react";

// NEW ENGINE IMPORTS
import ResumeRenderer from "../components/renderer/ResumeRenderer";
import { templateConfigs } from "../utils/templateConfigs";

// MANUAL PRESET DEFINITIONS - Kept for Gallery Display Logic
const manualPresets = [
    { id: "modern-1", name: "Modern Sidebar", layoutId: "modern", description: "Sidebar layout with colored left panel", previewColor: "#2563eb", themeId: "blue", fontId: "sans" },
    { id: "professional-1", name: "Professional Classic", layoutId: "professional", description: "Traditional top-header with two columns", previewColor: "#475569", themeId: "slate", fontId: "serif" },
    { id: "minimalist-1", name: "Clean Minimalist", layoutId: "minimalist", description: "Whitespace-heavy single column", previewColor: "#000000", themeId: "slate", fontId: "mono" },
    { id: "creative-1", name: "Creative Studio", layoutId: "creative", description: "Bold split design with colored sidebar", previewColor: "#7c3aed", themeId: "violet", fontId: "sans" },
    { id: "timeline-1", name: "Career Timeline", layoutId: "timeline", description: "Visual timeline with card-based sections", previewColor: "#059669", themeId: "emerald", fontId: "sans" },
    { id: "twocolumn-1", name: "Balanced Two-Column", layoutId: "twocolumn", description: "Equal 50/50 split with centered header", previewColor: "#0891b2", themeId: "cyan", fontId: "sans" },
    { id: "compact-1", name: "Compact Professional", layoutId: "compact", description: "Dense single column, ATS-friendly", previewColor: "#334155", themeId: "slate", fontId: "sans" },
    { id: "grid-1", name: "Grid Magazine", layoutId: "grid", description: "Magazine-style 3-column grid layout", previewColor: "#6366f1", themeId: "indigo", fontId: "sans" },
    { id: "header-1", name: "Header Dominant", layoutId: "headerfocused", description: "Large header with two columns below", previewColor: "#1e3a8a", themeId: "blue", fontId: "sans" },
    { id: "asymmetric-1", name: "Asymmetric Modern", layoutId: "asymmetric", description: "30/70 split with narrow sidebar", previewColor: "#0d9488", themeId: "teal", fontId: "sans" },
    { id: "horizontal-1", name: "Horizontal Sections", layoutId: "horizontal", description: "Full-width stacked sections", previewColor: "#475569", themeId: "slate", fontId: "sans" },
    { id: "tech-1", name: "Tech Minimalist", layoutId: "tech", description: "Code-inspired layout for developers", previewColor: "#0f172a", themeId: "slate", fontId: "mono" },
    { id: "executive-1", name: "Executive Serif", layoutId: "executive", description: "High-end traditional serif design", previewColor: "#1e293b", themeId: "slate", fontId: "serif" },
    { id: "bold-1", name: "Bold Contrast", layoutId: "bold", description: "High impact with thick borders", previewColor: "#000000", themeId: "monochrome", fontId: "sans" },
    { id: "swiss-1", name: "Swiss Grid", layoutId: "swiss", description: "Structured grid with Helvetica vibes", previewColor: "#dc2626", themeId: "red", fontId: "sans" },
    { id: "cards-1", name: "Modern Cards", layoutId: "cards", description: "Distinct cards for section separation", previewColor: "#4f46e5", themeId: "indigo", fontId: "sans" },
    { id: "atsclassic-1", name: "ATS Classic", layoutId: "atsclassic", description: "Ultra-simple, maximum ATS parseability", previewColor: "#000000", themeId: "slate", fontId: "sans" },
    { id: "atsmodern-1", name: "ATS Modern", layoutId: "atsmodern", description: "Clean ATS-friendly with subtle styling", previewColor: "#334155", themeId: "slate", fontId: "sans" }
];

export default function ResumeBuilder() {
    // FORM STATE
    const [formData, setFormData] = useState({
        fullName: "Alex Morgan",
        email: "alex.morgan@example.com",
        phone: "+1 (555) 123-4567",
        linkedin: "linkedin.com/in/alexmorgan",
        summary: "Results-driven professional with 5+ years of experience in software development and project management. Proven track record of delivering high-quality solutions on time and within budget.",
        experience: [
            { title: "Senior Developer", company: "Tech Solutions Inc.", date: "2020 - Present", desc: "Led a team of 5 developers building a cloud-based CRM. Improved system performance by 40%." },
            { title: "Web Developer", company: "Creative Agency", date: "2018 - 2020", desc: "Developed responsive websites for high-profile clients using React and Node.js." }
        ],
        education: [
            { degree: "B.S. Computer Science", school: "University of Technology", year: "2018" }
        ],
        projects: [
            { title: "E-Commerce Platform", desc: "Built a full-stack e-commerce app with React and Firebase." }
        ],
        certifications: "AWS Certified Solutions Architect, Google UX Design",
        coursework: "Data Structures, Algorithms, Database Management",
        involvement: "Volunteer Coding Tutor at Code for Good",
        skills: "JavaScript, React, Node.js, Python, Project Management, Agile/Scrum"
    });

    // View State
    const [viewMode, setViewMode] = useState("edit");
    const [showGallery, setShowGallery] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState(manualPresets[0]);

    // Print
    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `${formData.fullName}_Resume`,
    });

    // Inputs
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleArrayChange = (index, field, key, value) => {
        const newArray = [...formData[field]];
        newArray[index][key] = value;
        setFormData({ ...formData, [field]: newArray });
    };
    const addItem = (field, itemTemplate) => {
        setFormData({ ...formData, [field]: [...formData[field], itemTemplate] });
    };
    const removeItem = (field, index) => {
        const newArray = [...formData[field]];
        newArray.splice(index, 1);
        setFormData({ ...formData, [field]: newArray });
    };

    // --- ENGINE INTEGRATION ---
    const activeConfig = templateConfigs[selectedPreset.layoutId];

    // Inject current selected theme/font into the config for dynamic overrides
    const finalConfig = {
        ...activeConfig,
        themeId: selectedPreset.themeId,
        fontId: selectedPreset.fontId
    };

    // Filter Logic for Gallery
    const filteredPresets = manualPresets;

    if (viewMode === "edit") {
        return (
            <div className="container mx-auto p-4 lg:p-8 max-w-5xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Resume Editor</h1>
                        <p className="text-slate-500">Edit content and choose a design.</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setShowGallery(true)} className="flex items-center gap-2 bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                            <Layout size={18} /> Select Design
                        </button>
                        <button onClick={() => setViewMode("preview")} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 shadow-md">
                            <Eye size={18} /> Preview
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form - Unchanged */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Info */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-lg mb-4 text-slate-800">Personal Info</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" className="p-2 border rounded" />
                                <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="p-2 border rounded" />
                                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className="p-2 border rounded" />
                                <input name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="LinkedIn / Website" className="p-2 border rounded" />
                            </div>
                            <textarea name="summary" value={formData.summary} onChange={handleChange} placeholder="Professional Summary" className="w-full mt-4 p-2 border rounded h-24" />
                        </div>

                        {/* Experience */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                            <h3 className="font-bold text-lg mb-2 text-slate-800">Experience</h3>
                            {formData.experience.map((exp, idx) => (
                                <div key={idx} className="p-4 border rounded-lg bg-slate-50 space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <input value={exp.title} onChange={(e) => handleArrayChange(idx, 'experience', 'title', e.target.value)} placeholder="Job Title" className="w-full p-2 border rounded bg-white" />
                                        <input value={exp.company} onChange={(e) => handleArrayChange(idx, 'experience', 'company', e.target.value)} placeholder="Company" className="w-full p-2 border rounded bg-white" />
                                    </div>
                                    <input value={exp.date} onChange={(e) => handleArrayChange(idx, 'experience', 'date', e.target.value)} placeholder="Date Range" className="w-full p-2 border rounded bg-white" />
                                    <textarea value={exp.desc} onChange={(e) => handleArrayChange(idx, 'experience', 'desc', e.target.value)} placeholder="Description" className="w-full p-2 border rounded h-16 bg-white" />
                                    <button onClick={() => removeItem('experience', idx)} className="text-red-500 text-xs hover:underline">Remove</button>
                                </div>
                            ))}
                            <button onClick={() => addItem('experience', { title: "", company: "", date: "", desc: "" })} className="text-blue-600 text-sm font-medium hover:underline">+ Add Experience</button>
                        </div>

                        {/* Education */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                            <h3 className="font-bold text-lg mb-2 text-slate-800">Education</h3>
                            {formData.education.map((edu, idx) => (
                                <div key={idx} className="p-4 border rounded-lg bg-slate-50 space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <input value={edu.degree} onChange={(e) => handleArrayChange(idx, 'education', 'degree', e.target.value)} placeholder="Degree" className="w-full p-2 border rounded bg-white" />
                                        <input value={edu.school} onChange={(e) => handleArrayChange(idx, 'education', 'school', e.target.value)} placeholder="School/University" className="w-full p-2 border rounded bg-white" />
                                    </div>
                                    <input value={edu.year} onChange={(e) => handleArrayChange(idx, 'education', 'year', e.target.value)} placeholder="Year" className="w-full p-2 border rounded bg-white" />
                                    <button onClick={() => removeItem('education', idx)} className="text-red-500 text-xs hover:underline">Remove</button>
                                </div>
                            ))}
                            <button onClick={() => addItem('education', { degree: "", school: "", year: "" })} className="text-blue-600 text-sm font-medium hover:underline">+ Add Education</button>
                        </div>

                        {/* Projects */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                            <h3 className="font-bold text-lg mb-2 text-slate-800">Projects</h3>
                            {formData.projects.map((proj, idx) => (
                                <div key={idx} className="p-4 border rounded-lg bg-slate-50 space-y-2">
                                    <input value={proj.title} onChange={(e) => handleArrayChange(idx, 'projects', 'title', e.target.value)} placeholder="Project Title" className="w-full p-2 border rounded bg-white" />
                                    <textarea value={proj.desc} onChange={(e) => handleArrayChange(idx, 'projects', 'desc', e.target.value)} placeholder="Description" className="w-full p-2 border rounded h-16 bg-white" />
                                    <button onClick={() => removeItem('projects', idx)} className="text-red-500 text-xs hover:underline">Remove</button>
                                </div>
                            ))}
                            <button onClick={() => addItem('projects', { title: "", desc: "" })} className="text-blue-600 text-sm font-medium hover:underline">+ Add Project</button>
                        </div>

                        {/* Additional Info */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
                            <div><h3 className="font-bold text-lg mb-2 text-slate-800">Skills</h3><textarea name="skills" value={formData.skills} onChange={handleChange} placeholder="Skills..." className="w-full p-2 border rounded h-16" /></div>
                        </div>
                    </div>

                    {/* Sidebar Preview */}
                    <div className="hidden lg:block">
                        <div className="sticky top-8 border rounded-xl overflow-hidden shadow-lg bg-white h-[600px] scale-90 origin-top">
                            <div className="pointer-events-none transform origin-top-left scale-[0.4] w-[250%] h-[250%]">
                                <ResumeRenderer data={formData} config={finalConfig} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* GALLERY MODAL */}
                {showGallery && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
                            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                                <div><h2 className="text-2xl font-bold">Select a Design</h2><p className="text-slate-500 text-sm">Choose from {manualPresets.length} formats</p></div>
                                <button onClick={() => setShowGallery(false)}><X size={24} /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8 bg-slate-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredPresets.map(preset => (
                                        <button key={preset.id} onClick={() => { setSelectedPreset(preset); setShowGallery(false); }} className="text-left bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all h-full">
                                            <div className="h-64 bg-slate-50 relative p-4 flex items-center justify-center">
                                                <div className="font-bold text-slate-400">Preview Layout: {preset.layoutId}</div>
                                                {selectedPreset.id === preset.id && <div className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full"><Check size={16} /></div>}
                                            </div>
                                            <div className="p-4"><h3 className="font-bold">{preset.name}</h3><p className="text-sm text-slate-500">{preset.description}</p></div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center py-8">
            <div className="w-full max-w-6xl mb-4 flex justify-between items-center px-4">
                <button onClick={() => setViewMode("edit")} className="text-white flex items-center gap-2"><ChevronLeft /> Back to Editor</button>
                <button onClick={handlePrint} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"><Printer size={18} /> Download PDF</button>
            </div>
            <div className="bg-white shadow-2xl overflow-hidden rounded-sm" style={{ width: '210mm', minHeight: '297mm' }}>
                <div ref={componentRef} className="h-full w-full">
                    <ResumeRenderer data={formData} config={finalConfig} />
                </div>
            </div>
        </div>
    );
}
