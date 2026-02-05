import React, { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer } from "lucide-react";

export default function ResumeBuilder() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        summary: "",
        experience: [],
        education: [],
        skills: "",
    });

    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
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
    }

    return (
        <div className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Editor Side */}
            <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm h-fit">
                <h2 className="text-2xl font-bold dark:text-white">Resume Editor</h2>

                {/* Personal Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold dark:text-gray-200">Personal Info</h3>
                    <input
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        name="fullName"
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChange={handleChange}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <input
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            name="phone"
                            placeholder="Phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>
                    <textarea
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        name="summary"
                        placeholder="Professional Summary"
                        rows="3"
                        value={formData.summary}
                        onChange={handleChange}
                    />
                </div>

                {/* Experience */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold dark:text-gray-200">Experience</h3>
                        <button
                            onClick={() => addItem("experience", { title: "", company: "", date: "", desc: "" })}
                            className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                        >
                            + Add
                        </button>
                    </div>
                    {formData.experience.map((exp, idx) => (
                        <div key={idx} className="p-4 border rounded relative dark:border-gray-600">
                            <button onClick={() => removeItem("experience", idx)} className="absolute top-2 right-2 text-red-500 text-xs">Remove</button>
                            <input
                                className="w-full mb-2 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Job Title"
                                value={exp.title}
                                onChange={(e) => handleArrayChange(idx, "experience", "title", e.target.value)}
                            />
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <input
                                    className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Company"
                                    value={exp.company}
                                    onChange={(e) => handleArrayChange(idx, "experience", "company", e.target.value)}
                                />
                                <input
                                    className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Date Range"
                                    value={exp.date}
                                    onChange={(e) => handleArrayChange(idx, "experience", "date", e.target.value)}
                                />
                            </div>
                            <textarea
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Description"
                                rows="2"
                                value={exp.desc}
                                onChange={(e) => handleArrayChange(idx, "experience", "desc", e.target.value)}
                            />
                        </div>
                    ))}
                </div>

                {/* Education */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold dark:text-gray-200">Education</h3>
                        <button
                            onClick={() => addItem("education", { degree: "", school: "", year: "" })}
                            className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                        >
                            + Add
                        </button>
                    </div>
                    {formData.education.map((edu, idx) => (
                        <div key={idx} className="p-4 border rounded relative dark:border-gray-600">
                            <button onClick={() => removeItem("education", idx)} className="absolute top-2 right-2 text-red-500 text-xs">Remove</button>
                            <input
                                className="w-full mb-2 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Degree"
                                value={edu.degree}
                                onChange={(e) => handleArrayChange(idx, "education", "degree", e.target.value)}
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="School"
                                    value={edu.school}
                                    onChange={(e) => handleArrayChange(idx, "education", "school", e.target.value)}
                                />
                                <input
                                    className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Year"
                                    value={edu.year}
                                    onChange={(e) => handleArrayChange(idx, "education", "year", e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Skills */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold dark:text-gray-200">Skills</h3>
                    <textarea
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        name="skills"
                        placeholder="Comma separated skills (e.g. Python, React, Leadership)"
                        rows="2"
                        value={formData.skills}
                        onChange={handleChange}
                    />
                </div>
            </div>

            {/* Preview Side */}
            <div className="sticky top-6 h-fit bg-gray-200 dark:bg-gray-900 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold dark:text-white">Live Preview</h2>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow transition-colors"
                    >
                        <Printer size={18} /> Download/Print
                    </button>
                </div>

                <div className="overflow-auto max-h-[80vh] border rounded shadow-lg bg-white">
                    <div ref={componentRef} className="p-12 min-h-[1000px] w-full text-gray-800 bg-white">
                        {/* Resume Template */}
                        <div className="border-b-2 border-gray-800 pb-4 mb-6">
                            <h1 className="text-4xl font-bold text-gray-900 uppercase tracking-wide break-words">{formData.fullName || "Your Name"}</h1>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                                {formData.email && <span>{formData.email}</span>}
                                {formData.email && formData.phone && <span>|</span>}
                                {formData.phone && <span>{formData.phone}</span>}
                            </div>
                        </div>

                        {formData.summary && (
                            <div className="mb-6">
                                <h2 className="text-lg font-bold uppercase text-gray-700 border-b border-gray-300 mb-2">Professional Summary</h2>
                                <p className="text-sm leading-relaxed">{formData.summary}</p>
                            </div>
                        )}

                        {formData.experience.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-lg font-bold uppercase text-gray-700 border-b border-gray-300 mb-4">Experience</h2>
                                <div className="space-y-4">
                                    {formData.experience.map((exp, idx) => (
                                        <div key={idx}>
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className="font-bold text-gray-900">{exp.title || "Job Title"}</h3>
                                                <span className="text-xs text-gray-500 font-medium">{exp.date}</span>
                                            </div>
                                            <div className="text-sm text-gray-700 font-semibold mb-1">{exp.company}</div>
                                            <p className="text-xs whitespace-pre-wrap">{exp.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {formData.education.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-lg font-bold uppercase text-gray-700 border-b border-gray-300 mb-4">Education</h2>
                                <div className="space-y-3">
                                    {formData.education.map((edu, idx) => (
                                        <div key={idx} className="flex justify-between">
                                            <div>
                                                <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                                                <div className="text-sm text-gray-600">{edu.school}</div>
                                            </div>
                                            <div className="text-sm text-gray-500">{edu.year}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {formData.skills && (
                            <div className="mb-6">
                                <h2 className="text-lg font-bold uppercase text-gray-700 border-b border-gray-300 mb-2">Skills</h2>
                                <p className="text-sm">{formData.skills}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
