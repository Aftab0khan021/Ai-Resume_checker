import React, { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer, Layout, X, Eye, ChevronLeft, Check } from "lucide-react";
import { TemplateModern, TemplateProfessional, TemplateMinimalist, TemplateCreative, TemplateTimeline } from "../components/ResumeTemplates";
import { getThemeStyle, getFontStyle } from "../utils/templateThemes";

// MANUAL PRESET DEFINITIONS - 5 Distinct Designs per User Request
const manualPresets = [
    {
        id: "modern-1",
        name: "Modern Sidebar",
        layoutId: "modern",
        description: "Clean sidebar layout for professional impact",
        previewColor: "#2563eb", // Blue
        themeId: "blue",
        fontId: "sans"
    },
    {
        id: "professional-1",
        name: "Professional Classic",
        layoutId: "professional",
        description: "Traditional top-header layout for corporate roles",
        previewColor: "#475569", // Slate
        themeId: "slate",
        fontId: "serif"
    },
    {
        id: "creative-1",
        name: "Creative Studio",
        layoutId: "creative",
        description: "Bold split design for creative professionals",
        previewColor: "#7c3aed", // Violet
        themeId: "violet",
        fontId: "sans"
    },
    {
        id: "timeline-1",
        name: "Career Timeline",
        layoutId: "timeline",
        description: "Visual timeline focused on work history",
        previewColor: "#059669", // Emerald
        themeId: "emerald",
        fontId: "sans"
    },
    {
        id: "minimalist-1",
        name: "Clean Minimalist",
        layoutId: "minimalist",
        description: "Whitespace-heavy design for readability",
        previewColor: "#000000", // Black
        themeId: "slate",
        fontId: "mono"
    }
];

export default function ResumeBuilder() {
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

    // Selection State - Default to Modern
    const [selectedPreset, setSelectedPreset] = useState(manualPresets[0]);

    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `${formData.fullName}_Resume`,
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Handle Array Changes (Experience, Projects, Education)
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

    // Handle Template Selection
    const handlePresetSelect = (preset) => {
        setSelectedPreset(preset);
        setShowGallery(false);
    };

    // Resolve Component
    const templates = {
        modern: TemplateModern,
        professional: TemplateProfessional,
        minimalist: TemplateMinimalist,
        creative: TemplateCreative,
        timeline: TemplateTimeline
    };
    const SelectedTemplateComponent = templates[selectedPreset.layoutId] || TemplateModern;

    // Resolve Styles
    const currentThemeStyle = getThemeStyle(selectedPreset.themeId);
    const currentFontStyle = getFontStyle(selectedPreset.fontId);

    // Filter Logic
    const [filterCategory, setFilterCategory] = useState("all");
    const filteredPresets = filterCategory === "all"
        ? manualPresets
        : manualPresets.filter(p => p.layoutId.includes(filterCategory));

    // EDIT MODE
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
                    {/* Form */}
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

                        {/* Additional Info: Certifications, Coursework, Invention, Skills */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
                            <div>
                                <h3 className="font-bold text-lg mb-2 text-slate-800">Certifications</h3>
                                <textarea name="certifications" value={formData.certifications} onChange={handleChange} placeholder="List your certifications..." className="w-full p-2 border rounded h-16" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2 text-slate-800">Relevant Coursework</h3>
                                <textarea name="coursework" value={formData.coursework} onChange={handleChange} placeholder="List relevant coursework..." className="w-full p-2 border rounded h-16" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2 text-slate-800">Involvement / Volunteering</h3>
                                <textarea name="involvement" value={formData.involvement} onChange={handleChange} placeholder="Clubs, volunteering, leadership roles..." className="w-full p-2 border rounded h-16" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2 text-slate-800">Skills</h3>
                                <textarea name="skills" value={formData.skills} onChange={handleChange} placeholder="Skills (comma separated)" className="w-full p-2 border rounded h-16" />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Preview */}
                    <div className="hidden lg:block">
                        <div className="sticky top-8 border rounded-xl overflow-hidden shadow-lg bg-white h-[600px] scale-90 origin-top">
                            <div className="pointer-events-none transform origin-top-left scale-[0.4] w-[250%] h-[250%]">
                                <SelectedTemplateComponent data={formData} theme={currentThemeStyle} font={currentFontStyle} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* GALLERY MODAL */}
                {showGallery && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
                            {/* Header */}
                            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">Select a Design</h2>
                                    <p className="text-slate-500 text-sm">Choose from {manualPresets.length} distinct structural layouts</p>
                                </div>
                                <button onClick={() => setShowGallery(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24} /></button>
                            </div>

                            {/* Filters */}
                            <div className="p-4 border-b flex gap-2 overflow-x-auto">
                                <button onClick={() => setFilterCategory("all")} className={`px-4 py-2 rounded-full text-sm font-medium ${filterCategory === "all" ? "bg-slate-900 text-white" : "bg-white border text-slate-600"}`}>All Designs</button>
                                <button onClick={() => setFilterCategory("modern")} className={`px-4 py-2 rounded-full text-sm font-medium ${filterCategory === "modern" ? "bg-slate-900 text-white" : "bg-white border text-slate-600"}`}>Modern</button>
                                <button onClick={() => setFilterCategory("creative")} className={`px-4 py-2 rounded-full text-sm font-medium ${filterCategory === "creative" ? "bg-slate-900 text-white" : "bg-white border text-slate-600"}`}>Creative</button>
                                <button onClick={() => setFilterCategory("timeline")} className={`px-4 py-2 rounded-full text-sm font-medium ${filterCategory === "timeline" ? "bg-slate-900 text-white" : "bg-white border text-slate-600"}`}>Timeline</button>
                            </div>

                            {/* Grid */}
                            <div className="flex-1 overflow-y-auto p-8 bg-slate-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredPresets.map(preset => (
                                        <button
                                            key={preset.id}
                                            onClick={() => handlePresetSelect(preset)}
                                            className="group text-left bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:ring-2 ring-blue-500 transition-all duration-300 flex flex-col h-full"
                                        >
                                            <div className="h-64 bg-slate-50 relative p-4 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                                                {/* ACTUAL PREVIEW RENDER */}
                                                <div className="w-full h-full shadow-md bg-white text-[5px] overflow-hidden select-none pointer-events-none transform transition-transform group-hover:scale-[1.02]">
                                                    {/* Modern Preview */}
                                                    {preset.layoutId === 'modern' && (
                                                        <div className="flex h-full">
                                                            <div className="w-1/3 h-full bg-blue-600 p-2 text-white flex flex-col gap-2">
                                                                <div className="w-8 h-8 rounded-full bg-white/20"></div>
                                                                <div className="h-1 w-full bg-white/20 rounded"></div>
                                                                <div className="h-1 w-2/3 bg-white/20 rounded"></div>
                                                            </div>
                                                            <div className="w-2/3 p-2 flex flex-col gap-2">
                                                                <div className="h-3 w-3/4 bg-slate-200 rounded"></div>
                                                                <div className="h-1 w-full bg-slate-100 rounded"></div>
                                                                <div className="h-1 w-full bg-slate-100 rounded"></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Professional Preview */}
                                                    {preset.layoutId === 'professional' && (
                                                        <div className="flex flex-col h-full p-3 items-center">
                                                            <div className="h-4 w-3/4 bg-slate-700 mb-2 rounded"></div>
                                                            <div className="h-px w-full bg-slate-200 mb-2"></div>
                                                            <div className="w-full flex flex-col gap-2">
                                                                <div className="h-2 w-1/4 bg-slate-300 rounded mb-1"></div>
                                                                <div className="h-1 w-full bg-slate-100 rounded"></div>
                                                                <div className="h-1 w-full bg-slate-100 rounded"></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Creative Preview */}
                                                    {preset.layoutId === 'creative' && (
                                                        <div className="flex h-full">
                                                            <div className="w-1/4 h-full bg-violet-600 flex flex-col items-center pt-4">
                                                                <div className="w-8 h-8 bg-white/30 rounded-full"></div>
                                                            </div>
                                                            <div className="w-3/4 p-3">
                                                                <div className="h-6 w-full bg-violet-100 rounded mb-2 text-violet-800 font-bold px-1 flex items-center">NAME</div>
                                                                <div className="h-1 w-full bg-slate-100 mb-1"></div>
                                                                <div className="h-1 w-full bg-slate-100"></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Timeline Preview */}
                                                    {preset.layoutId === 'timeline' && (
                                                        <div className="flex flex-col h-full p-2 items-center relative">
                                                            <div className="h-3 w-1/2 bg-emerald-600 rounded mb-2"></div>
                                                            <div className="absolute top-8 bottom-2 w-px bg-slate-200"></div>
                                                            <div className="w-full grid grid-cols-2 gap-2 mt-2">
                                                                <div className="text-right"><div className="h-1 w-full bg-slate-100 inline-block"></div></div>
                                                                <div><div className="h-1 w-full bg-slate-200 inline-block"></div></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Minimalist Preview */}
                                                    {preset.layoutId === 'minimalist' && (
                                                        <div className="flex flex-col h-full p-4">
                                                            <div className="h-5 w-2/3 bg-slate-900 rounded mb-4"></div>
                                                            <div className="grid grid-cols-3 gap-2 h-full">
                                                                <div className="col-span-1 border-r border-slate-100 pr-1">
                                                                    <div className="h-1 w-full bg-slate-100 mb-1"></div>
                                                                    <div className="h-1 w-full bg-slate-100 mb-1"></div>
                                                                </div>
                                                                <div className="col-span-2">
                                                                    <div className="h-1 w-full bg-slate-200 mb-1"></div>
                                                                    <div className="h-1 w-full bg-slate-100 mb-1"></div>
                                                                    <div className="h-1 w-full bg-slate-100"></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Selection Check */}
                                                {selectedPreset.id === preset.id && (
                                                    <div className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full shadow-lg animate-in zoom-in">
                                                        <Check size={16} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-slate-900">{preset.name}</h3>
                                                <p className="text-sm text-slate-500 mt-1">{preset.description}</p>
                                            </div>
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

    // PREVIEW MODE
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center py-8">
            <div className="w-full max-w-6xl mb-4 flex justify-between items-center px-4">
                <button onClick={() => setViewMode("edit")} className="text-white flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <ChevronLeft /> Back to Editor
                </button>
                <div className="flex gap-4">
                    <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition-all flex items-center gap-2">
                        <Printer size={18} /> Download PDF
                    </button>
                </div>
            </div>

            <div className="bg-white shadow-2xl overflow-hidden rounded-sm" style={{ width: '210mm', minHeight: '297mm' }}>
                <div ref={componentRef} className="h-full w-full">
                    <SelectedTemplateComponent data={formData} theme={currentThemeStyle} font={currentFontStyle} />
                </div>
            </div>
        </div>
    );
}
