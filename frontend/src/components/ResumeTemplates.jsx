import React from "react";

export const TemplateModern = ({ data }) => {
    return (
        <div className="flex h-full min-h-[1000px] w-full bg-white text-gray-800 font-sans">
            {/* Sidebar */}
            <div className="w-1/3 bg-slate-900 text-white p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold leading-tight uppercase tracking-wider">{data.fullName}</h1>
                    <p className="mt-4 text-slate-300 text-sm">{data.email}</p>
                    <p className="text-slate-300 text-sm">{data.phone}</p>
                </div>

                {data.skills && (
                    <div className="mb-8">
                        <h3 className="text-lg font-bold uppercase tracking-widest border-b border-slate-700 pb-2 mb-4 text-blue-400">Skills</h3>
                        <p className="text-sm leading-relaxed text-slate-300">{data.skills}</p>
                    </div>
                )}

                {data.education.length > 0 && (
                    <div>
                        <h3 className="text-lg font-bold uppercase tracking-widest border-b border-slate-700 pb-2 mb-4 text-blue-400">Education</h3>
                        <div className="space-y-6">
                            {data.education.map((edu, idx) => (
                                <div key={idx}>
                                    <h4 className="font-bold text-white">{edu.degree}</h4>
                                    <div className="text-sm text-slate-400">{edu.school}</div>
                                    <div className="text-xs text-slate-500 mt-1">{edu.year}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="w-2/3 p-8">
                {data.summary && (
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold uppercase text-slate-900 border-b-2 border-slate-200 pb-2 mb-4">Profile</h3>
                        <p className="text-gray-600 leading-relaxed">{data.summary}</p>
                    </div>
                )}

                {data.experience.length > 0 && (
                    <div>
                        <h3 className="text-2xl font-bold uppercase text-slate-900 border-b-2 border-slate-200 pb-2 mb-4">Experience</h3>
                        <div className="space-y-6">
                            {data.experience.map((exp, idx) => (
                                <div key={idx} className="relative pl-4 border-l-2 border-blue-100">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="text-lg font-bold text-slate-800">{exp.title}</h4>
                                        <span className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">{exp.date}</span>
                                    </div>
                                    <div className="text-md text-slate-600 font-semibold mb-2">{exp.company}</div>
                                    <p className="text-sm text-gray-500 whitespace-pre-wrap leading-relaxed">{exp.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const TemplateProfessional = ({ data }) => {
    return (
        <div className="p-12 min-h-[1000px] w-full bg-white text-gray-900 font-serif">
            <div className="text-center border-b-2 border-gray-900 pb-6 mb-8">
                <h1 className="text-4xl font-bold uppercase tracking-widest mb-3">{data.fullName}</h1>
                <div className="flex justify-center gap-4 text-sm font-medium">
                    {data.email && <span>{data.email}</span>}
                    {data.phone && <span>• {data.phone}</span>}
                </div>
            </div>

            {data.summary && (
                <div className="mb-6">
                    <h3 className="text-md font-bold uppercase border-b border-gray-300 mb-3 pb-1">Professional Summary</h3>
                    <p className="text-sm leading-relaxed text-justify">{data.summary}</p>
                </div>
            )}

            {data.experience.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-md font-bold uppercase border-b border-gray-300 mb-4 pb-1">Work Experience</h3>
                    <div className="space-y-5">
                        {data.experience.map((exp, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between items-end mb-1">
                                    <h4 className="font-bold text-lg">{exp.title}</h4>
                                    <span className="text-sm italic">{exp.date}</span>
                                </div>
                                <div className="text-sm font-semibold mb-2">{exp.company}</div>
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{exp.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-8">
                {data.education.length > 0 && (
                    <div className="flex-1">
                        <h3 className="text-md font-bold uppercase border-b border-gray-300 mb-4 pb-1">Education</h3>
                        <div className="space-y-4">
                            {data.education.map((edu, idx) => (
                                <div key={idx}>
                                    <h4 className="font-bold">{edu.degree}</h4>
                                    <div className="text-sm">{edu.school}</div>
                                    <div className="text-sm italic text-gray-600">{edu.year}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {data.skills && (
                    <div className="flex-1">
                        <h3 className="text-md font-bold uppercase border-b border-gray-300 mb-4 pb-1">Skills</h3>
                        <p className="text-sm leading-7">{data.skills}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export const TemplateMinimalist = ({ data }) => {
    return (
        <div className="p-12 min-h-[1000px] w-full bg-white text-gray-800 font-sans">
            <header className="mb-12">
                <h1 className="text-5xl font-light tracking-tight text-slate-900 mb-4">{data.fullName}</h1>
                <div className="flex flex-col gap-1 text-sm text-gray-500">
                    {data.email && <span>{data.email}</span>}
                    {data.phone && <span>{data.phone}</span>}
                </div>
            </header>

            <div className="grid grid-cols-4 gap-8">
                <div className="col-span-1 space-y-8">
                    {data.education.length > 0 && (
                        <section>
                            <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-4">Education</h3>
                            <div className="space-y-6">
                                {data.education.map((edu, idx) => (
                                    <div key={idx}>
                                        <div className="font-semibold text-slate-900">{edu.school}</div>
                                        <div className="text-sm text-gray-600">{edu.degree}</div>
                                        <div className="text-xs text-gray-400 mt-1">{edu.year}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {data.skills && (
                        <section>
                            <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-4">Skills</h3>
                            <p className="text-sm leading-6">{data.skills}</p>
                        </section>
                    )}
                </div>

                <div className="col-span-3 space-y-10">
                    {data.summary && (
                        <section>
                            <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-4">About</h3>
                            <p className="text-sm leading-relaxed text-gray-700 max-w-2xl">{data.summary}</p>
                        </section>
                    )}

                    {data.experience.length > 0 && (
                        <section>
                            <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-6">Experience</h3>
                            <div className="space-y-8">
                                {data.experience.map((exp, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between items-baseline mb-2">
                                            <h4 className="text-lg font-medium text-slate-900">{exp.title}</h4>
                                            <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">{exp.date}</span>
                                        </div>
                                        <div className="text-sm font-medium text-gray-500 mb-3">{exp.company}</div>
                                        <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed max-w-2xl">{exp.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};
