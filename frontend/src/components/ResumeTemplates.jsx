import React from "react";

// Helper to inject dynamic styles
const StyleInjector = ({ theme, font }) => (
    <style>{`
        .theme-primary { color: ${theme.primary}; }
        .theme-bg-primary { background-color: ${theme.primary}; }
        .theme-secondary { color: ${theme.secondary}; }
        .theme-bg-secondary { background-color: ${theme.secondary}; }
        .theme-accent { color: ${theme.accent}; }
        .theme-bg-accent { background-color: ${theme.accent}; }
        .theme-text { color: ${theme.text}; }
        .theme-bg-page { background-color: ${theme.bg}; }
        .font-heading { font-family: ${font.heading === 'font-sans' ? 'ui-sans-serif, system-ui, sans-serif' : font.heading === 'font-serif' ? 'ui-serif, Georgia, serif' : 'ui-monospace, monospace'}; }
        .font-body { font-family: ${font.body === 'font-sans' ? 'ui-sans-serif, system-ui, sans-serif' : font.body === 'font-serif' ? 'ui-serif, Georgia, serif' : 'ui-monospace, monospace'}; }
    `}</style>
);

export const TemplateModern = ({ data, theme, font }) => {
    return (
        <div className="flex h-full min-h-[1000px] w-full font-body bg-white text-slate-800">
            <StyleInjector theme={theme} font={font} />

            {/* Sidebar */}
            <div className="w-1/3 theme-bg-primary text-white p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold leading-tight uppercase tracking-wider font-heading">{data.fullName}</h1>
                    <p className="mt-4 opacity-90 text-sm">{data.email}</p>
                    <p className="opacity-90 text-sm">{data.phone}</p>
                </div>

                {data.skills && (
                    <div className="mb-8">
                        <h3 className="text-lg font-bold uppercase tracking-widest border-b border-white/20 pb-2 mb-4 theme-accent font-heading">Skills</h3>
                        <p className="text-sm leading-relaxed opacity-90">{data.skills}</p>
                    </div>
                )}

                {data.education.length > 0 && (
                    <div>
                        <h3 className="text-lg font-bold uppercase tracking-widest border-b border-white/20 pb-2 mb-4 theme-accent font-heading">Education</h3>
                        <div className="space-y-6">
                            {data.education.map((edu, idx) => (
                                <div key={idx}>
                                    <h4 className="font-bold text-white">{edu.degree}</h4>
                                    <div className="text-sm opacity-80">{edu.school}</div>
                                    <div className="text-xs opacity-60 mt-1">{edu.year}</div>
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
                        <h3 className="text-2xl font-bold uppercase theme-text border-b-2 theme-secondary pb-2 mb-4 font-heading">Profile</h3>
                        <p className="text-gray-600 leading-relaxed">{data.summary}</p>
                    </div>
                )}

                {data.experience.length > 0 && (
                    <div>
                        <h3 className="text-2xl font-bold uppercase theme-text border-b-2 theme-secondary pb-2 mb-4 font-heading">Experience</h3>
                        <div className="space-y-6">
                            {data.experience.map((exp, idx) => (
                                <div key={idx} className="relative pl-4 border-l-2 theme-secondary" style={{ borderColor: theme.secondary }}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="text-lg font-bold theme-primary">{exp.title}</h4>
                                        <span className="text-sm theme-bg-accent text-white font-medium px-2 py-0.5 rounded">{exp.date}</span>
                                    </div>
                                    <div className="text-md theme-secondary font-semibold mb-2">{exp.company}</div>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{exp.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const TemplateProfessional = ({ data, theme, font }) => {
    return (
        <div className="p-12 min-h-[1000px] w-full bg-white font-body theme-text">
            <StyleInjector theme={theme} font={font} />

            <div className="text-center border-b-2 theme-primary pb-6 mb-8" style={{ borderColor: theme.primary }}>
                <h1 className="text-4xl font-bold uppercase tracking-widest mb-3 theme-primary font-heading">{data.fullName}</h1>
                <div className="flex justify-center gap-4 text-sm font-medium theme-secondary">
                    {data.email && <span>{data.email}</span>}
                    {data.phone && <span>• {data.phone}</span>}
                </div>
            </div>

            {data.summary && (
                <div className="mb-6">
                    <h3 className="text-md font-bold uppercase border-b border-gray-300 mb-3 pb-1 theme-text font-heading">Professional Summary</h3>
                    <p className="text-sm leading-relaxed text-justify">{data.summary}</p>
                </div>
            )}

            {data.experience.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-md font-bold uppercase border-b border-gray-300 mb-4 pb-1 theme-text font-heading">Work Experience</h3>
                    <div className="space-y-5">
                        {data.experience.map((exp, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between items-end mb-1">
                                    <h4 className="font-bold text-lg theme-primary">{exp.title}</h4>
                                    <span className="text-sm italic theme-secondary">{exp.date}</span>
                                </div>
                                <div className="text-sm font-semibold mb-2 theme-text">{exp.company}</div>
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{exp.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-8">
                {data.education.length > 0 && (
                    <div className="flex-1">
                        <h3 className="text-md font-bold uppercase border-b border-gray-300 mb-4 pb-1 theme-text font-heading">Education</h3>
                        <div className="space-y-4">
                            {data.education.map((edu, idx) => (
                                <div key={idx}>
                                    <h4 className="font-bold theme-primary">{edu.degree}</h4>
                                    <div className="text-sm theme-secondary">{edu.school}</div>
                                    <div className="text-sm italic text-gray-500">{edu.year}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {data.skills && (
                    <div className="flex-1">
                        <h3 className="text-md font-bold uppercase border-b border-gray-300 mb-4 pb-1 theme-text font-heading">Skills</h3>
                        <p className="text-sm leading-7">{data.skills}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export const TemplateMinimalist = ({ data, theme, font }) => {
    return (
        <div className="p-12 min-h-[1000px] w-full theme-bg-page font-body theme-text">
            <StyleInjector theme={theme} font={font} />

            <header className="mb-12">
                <h1 className="text-5xl font-light tracking-tight theme-primary mb-4 font-heading">{data.fullName}</h1>
                <div className="flex flex-col gap-1 text-sm theme-secondary">
                    {data.email && <span>{data.email}</span>}
                    {data.phone && <span>{data.phone}</span>}
                </div>
            </header>

            <div className="grid grid-cols-4 gap-8">
                <div className="col-span-1 space-y-8">
                    {data.education.length > 0 && (
                        <section>
                            <h3 className="font-bold text-xs uppercase tracking-widest mb-4 theme-accent font-heading">Education</h3>
                            <div className="space-y-6">
                                {data.education.map((edu, idx) => (
                                    <div key={idx}>
                                        <div className="font-semibold theme-primary">{edu.school}</div>
                                        <div className="text-sm theme-secondary">{edu.degree}</div>
                                        <div className="text-xs opacity-60 mt-1">{edu.year}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {data.skills && (
                        <section>
                            <h3 className="font-bold text-xs uppercase tracking-widest mb-4 theme-accent font-heading">Skills</h3>
                            <p className="text-sm leading-6 theme-secondary">{data.skills}</p>
                        </section>
                    )}
                </div>

                <div className="col-span-3 space-y-10">
                    {data.summary && (
                        <section>
                            <h3 className="font-bold text-xs uppercase tracking-widest mb-4 theme-accent font-heading">About</h3>
                            <p className="text-sm leading-relaxed theme-text max-w-2xl">{data.summary}</p>
                        </section>
                    )}

                    {data.experience.length > 0 && (
                        <section>
                            <h3 className="font-bold text-xs uppercase tracking-widest mb-6 theme-accent font-heading">Experience</h3>
                            <div className="space-y-8">
                                {data.experience.map((exp, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between items-baseline mb-2">
                                            <h4 className="text-lg font-medium theme-primary">{exp.title}</h4>
                                            <span className="text-xs font-mono theme-bg-secondary text-white px-2 py-1 rounded">{exp.date}</span>
                                        </div>
                                        <div className="text-sm font-medium theme-text opacity-75 mb-3">{exp.company}</div>
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
