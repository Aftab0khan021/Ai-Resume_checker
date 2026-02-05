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

// --- HELPER COMPONENT FOR NEW SECTIONS ---
const SectionBlock = ({ title, content, className, titleClass, contentClass }) => {
    if (!content || (Array.isArray(content) && content.length === 0)) return null;
    return (
        <div className={className}>
            <h3 className={titleClass}>{title}</h3>
            {typeof content === "string" ? (
                <p className={contentClass}>{content}</p>
            ) : (
                <div className="space-y-4">
                    {content.map((item, idx) => (
                        <div key={idx}>
                            <h4 className="font-bold">{item.title}</h4>
                            <p className={contentClass}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


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
                    <p className="opacity-90 text-sm">{data.linkedin}</p>
                </div>

                {data.skills && (
                    <div className="mb-8">
                        <h3 className="text-lg font-bold uppercase tracking-widest border-b border-white/20 pb-2 mb-4 theme-accent font-heading">Skills</h3>
                        <p className="text-sm leading-relaxed opacity-90">{data.skills}</p>
                    </div>
                )}

                {data.education && data.education.length > 0 && (
                    <div className="mb-8">
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

                {/* Sidebar New Sections: Certifications, Coursework */}
                <SectionBlock
                    title="Certifications"
                    content={data.certifications}
                    className="mb-8"
                    titleClass="text-lg font-bold uppercase tracking-widest border-b border-white/20 pb-2 mb-4 theme-accent font-heading"
                    contentClass="text-sm leading-relaxed opacity-90"
                />
                <SectionBlock
                    title="Coursework"
                    content={data.coursework}
                    className="mb-8"
                    titleClass="text-lg font-bold uppercase tracking-widest border-b border-white/20 pb-2 mb-4 theme-accent font-heading"
                    contentClass="text-sm leading-relaxed opacity-90"
                />
            </div>

            {/* Main Content */}
            <div className="w-2/3 p-8">
                {data.summary && (
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold uppercase theme-text border-b-2 theme-secondary pb-2 mb-4 font-heading">Profile</h3>
                        <p className="text-gray-600 leading-relaxed">{data.summary}</p>
                    </div>
                )}

                {data.experience && data.experience.length > 0 && (
                    <div className="mb-8">
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

                {/* Main Content New Sections: Projects, Involvement */}
                {data.projects && data.projects.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold uppercase theme-text border-b-2 theme-secondary pb-2 mb-4 font-heading">Projects</h3>
                        <div className="space-y-4">
                            {data.projects.map((proj, idx) => (
                                <div key={idx} className="bg-slate-50 p-4 rounded-lg">
                                    <h4 className="text-lg font-bold theme-primary mb-1">{proj.title}</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">{proj.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {data.involvement && (
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold uppercase theme-text border-b-2 theme-secondary pb-2 mb-4 font-heading">Involvement</h3>
                        <p className="text-gray-600 leading-relaxed">{data.involvement}</p>
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
                    {data.linkedin && <span>• {data.linkedin}</span>}
                </div>
            </div>

            {data.summary && (
                <div className="mb-6">
                    <h3 className="text-md font-bold uppercase border-b border-gray-300 mb-3 pb-1 theme-text font-heading">Professional Summary</h3>
                    <p className="text-sm leading-relaxed text-justify">{data.summary}</p>
                </div>
            )}

            {data.experience && data.experience.length > 0 && (
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

            {data.projects && data.projects.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-md font-bold uppercase border-b border-gray-300 mb-4 pb-1 theme-text font-heading">Key Projects</h3>
                    <div className="space-y-4">
                        {data.projects.map((proj, idx) => (
                            <div key={idx}>
                                <h4 className="font-bold text-md theme-primary">{proj.title}</h4>
                                <p className="text-sm leading-relaxed">{proj.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-8">
                <div className="flex-1 space-y-6">
                    {data.education && data.education.length > 0 && (
                        <div>
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
                    {data.certifications && (
                        <div>
                            <h3 className="text-md font-bold uppercase border-b border-gray-300 mb-4 pb-1 theme-text font-heading">Certifications</h3>
                            <p className="text-sm leading-7">{data.certifications}</p>
                        </div>
                    )}
                </div>

                <div className="flex-1 space-y-6">
                    {data.skills && (
                        <div>
                            <h3 className="text-md font-bold uppercase border-b border-gray-300 mb-4 pb-1 theme-text font-heading">Skills</h3>
                            <p className="text-sm leading-7">{data.skills}</p>
                        </div>
                    )}
                    {data.coursework && (
                        <div>
                            <h3 className="text-md font-bold uppercase border-b border-gray-300 mb-4 pb-1 theme-text font-heading">Relevant Coursework</h3>
                            <p className="text-sm leading-7">{data.coursework}</p>
                        </div>
                    )}
                    {data.involvement && (
                        <div>
                            <h3 className="text-md font-bold uppercase border-b border-gray-300 mb-4 pb-1 theme-text font-heading">Involvement</h3>
                            <p className="text-sm leading-7">{data.involvement}</p>
                        </div>
                    )}
                </div>
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
                    {data.linkedin && <span>{data.linkedin}</span>}
                </div>
            </header>

            <div className="grid grid-cols-4 gap-8">
                <div className="col-span-1 space-y-8">
                    {data.education && data.education.length > 0 && (
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

                    {data.certifications && (
                        <section>
                            <h3 className="font-bold text-xs uppercase tracking-widest mb-4 theme-accent font-heading">Certifications</h3>
                            <p className="text-sm leading-6 theme-secondary">{data.certifications}</p>
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

                    {data.experience && data.experience.length > 0 && (
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

                    {data.projects && data.projects.length > 0 && (
                        <section>
                            <h3 className="font-bold text-xs uppercase tracking-widest mb-6 theme-accent font-heading">Projects</h3>
                            <div className="space-y-6">
                                {data.projects.map((proj, idx) => (
                                    <div key={idx}>
                                        <h4 className="text-lg font-medium theme-primary mb-1">{proj.title}</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">{proj.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {data.involvement && (
                        <section>
                            <h3 className="font-bold text-xs uppercase tracking-widest mb-4 theme-accent font-heading">Involvement</h3>
                            <p className="text-sm leading-relaxed theme-text max-w-2xl">{data.involvement}</p>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};

export const TemplateCreative = ({ data, theme, font }) => {
    return (
        <div className="flex h-full min-h-[1000px] w-full font-body bg-white text-slate-800">
            <StyleInjector theme={theme} font={font} />

            {/* Sidebar (Left) - Narrower and Styled */}
            <div className="w-1/4 theme-bg-secondary text-white p-6 flex flex-col items-center text-center" style={{ backgroundColor: theme.secondary }}>
                <div className="w-24 h-24 rounded-full bg-white/20 mb-6 flex items-center justify-center text-3xl font-bold">
                    {data.fullName ? data.fullName.charAt(0) : "U"}
                </div>

                <div className="space-y-6 w-full text-left">
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2 border-b border-white/20 pb-1">Contact</h3>
                        <div className="text-xs break-words">{data.email}</div>
                        <div className="text-xs">{data.phone}</div>
                        <div className="text-xs break-words mt-1">{data.linkedin}</div>
                    </div>

                    {data.skills && (
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2 border-b border-white/20 pb-1">Skills</h3>
                            <p className="text-xs leading-relaxed">{data.skills}</p>
                        </div>
                    )}

                    {data.certifications && (
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2 border-b border-white/20 pb-1">Certifications</h3>
                            <p className="text-xs leading-relaxed">{data.certifications}</p>
                        </div>
                    )}
                    {data.coursework && (
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2 border-b border-white/20 pb-1">Coursework</h3>
                            <p className="text-xs leading-relaxed">{data.coursework}</p>
                        </div>
                    )}

                    {data.education && data.education.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2 border-b border-white/20 pb-1">Education</h3>
                            <div className="space-y-4">
                                {data.education.map((edu, idx) => (
                                    <div key={idx}>
                                        <div className="font-bold text-xs">{edu.degree}</div>
                                        <div className="text-[10px] opacity-80">{edu.school}</div>
                                        <div className="text-[10px] opacity-60">{edu.year}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content (Right) */}
            <div className="w-3/4 p-10 relative">
                <div className="absolute top-0 left-0 w-full h-4 theme-bg-primary" style={{ backgroundColor: theme.primary }}></div>

                <div className="mt-8 mb-10">
                    <h1 className="text-4xl font-black uppercase tracking-tighter theme-primary font-heading" style={{ color: theme.primary }}>{data.fullName}</h1>
                    <p className="text-lg text-slate-500 font-light tracking-wide">Professional Resume</p>
                </div>

                {data.summary && (
                    <div className="mb-10 flex gap-4">
                        <div className="w-12 h-1 theme-bg-primary mt-3 shrink-0" style={{ backgroundColor: theme.primary }}></div>
                        <p className="text-sm leading-7 text-slate-600 italic">{data.summary}</p>
                    </div>
                )}

                {data.experience && data.experience.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                            <span className="theme-text" style={{ color: theme.text }}>Experience</span>
                            <span className="h-px flex-1 bg-slate-200"></span>
                        </h3>
                        <div className="grid grid-cols-1 gap-8">
                            {data.experience.map((exp, idx) => (
                                <div key={idx} className="group">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="text-lg font-bold theme-primary group-hover:translate-x-1 transition-transform" style={{ color: theme.primary }}>{exp.title}</h4>
                                        <span className="text-xs font-bold theme-bg-primary text-white px-2 py-1" style={{ backgroundColor: theme.primary }}>{exp.date}</span>
                                    </div>
                                    <div className="text-sm font-bold uppercase tracking-wide text-slate-400 mb-3">{exp.company}</div>
                                    <p className="text-sm text-slate-600 leading-relaxed border-l-2 pl-4 border-slate-100">{exp.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {data.projects && data.projects.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                            <span className="theme-text" style={{ color: theme.text }}>Projects</span>
                            <span className="h-px flex-1 bg-slate-200"></span>
                        </h3>
                        <div className="grid grid-cols-1 gap-8">
                            {data.projects.map((proj, idx) => (
                                <div key={idx} className="group">
                                    <h4 className="text-lg font-bold theme-primary group-hover:translate-x-1 transition-transform" style={{ color: theme.primary }}>{proj.title}</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed mt-1">{proj.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {data.involvement && (
                    <div className="mb-8">
                        <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                            <span className="theme-text" style={{ color: theme.text }}>Involvement</span>
                            <span className="h-px flex-1 bg-slate-200"></span>
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">{data.involvement}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export const TemplateTimeline = ({ data, theme, font }) => {
    return (
        <div className="p-10 min-h-[1000px] w-full bg-slate-50 font-body theme-text relative overflow-hidden">
            <StyleInjector theme={theme} font={font} />

            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 theme-bg-accent opacity-10 rounded-full blur-3xl -mr-32 -mt-32" style={{ backgroundColor: theme.accent }}></div>

            <div className="relative z-10 max-w-3xl mx-auto">
                <header className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4 theme-primary font-heading" style={{ color: theme.primary }}>{data.fullName}</h1>
                    <div className="flex justify-center gap-2 text-sm theme-secondary font-mono" style={{ color: theme.secondary }}>
                        <span>{data.email}</span>
                        {data.phone && <span> {'//'} {data.phone}</span>}
                        {data.linkedin && <span> {'//'} {data.linkedin}</span>}
                    </div>
                    {data.summary && (
                        <div className="mt-6 p-4 bg-white shadow-sm rounded-xl border border-slate-200 text-sm leading-relaxed text-center">
                            {data.summary}
                        </div>
                    )}
                </header>

                {data.experience && data.experience.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-px bg-slate-300 flex-1"></div>
                            <h3 className="text-center font-bold uppercase tracking-widest text-sm theme-primary" style={{ color: theme.primary }}>Experience Timeline</h3>
                            <div className="h-px bg-slate-300 flex-1"></div>
                        </div>

                        <div className="relative border-l-2 border-slate-200 ml-4 md:ml-0 md:border-l-0 md:space-y-8">
                            {data.experience.map((exp, idx) => (
                                <div key={idx} className="relative md:grid md:grid-cols-5 md:gap-8 group">
                                    {/* Timeline Dot (Mobile) */}
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white theme-bg-primary md:hidden" style={{ backgroundColor: theme.primary }}></div>

                                    {/* Left Side (Date) */}
                                    <div className="hidden md:block md:col-span-1 md:text-right pt-1">
                                        <div className="font-bold text-sm theme-secondary" style={{ color: theme.secondary }}>{exp.date}</div>
                                    </div>

                                    {/* Center Line & Dot (Desktop) */}
                                    <div className="hidden md:flex md:col-span-1 justify-center relative">
                                        <div className="h-full w-px bg-slate-200 absolute top-0"></div>
                                        <div className="w-4 h-4 rounded-full border-4 border-white theme-bg-primary relative z-10" style={{ backgroundColor: theme.primary }}></div>
                                    </div>

                                    {/* Right Side (Content) */}
                                    <div className="pl-6 pb-8 md:pl-0 md:pb-0 md:col-span-3">
                                        <div className="md:hidden text-xs font-bold theme-secondary mb-1" style={{ color: theme.secondary }}>{exp.date}</div>
                                        <h4 className="font-bold text-lg leading-none mb-1 theme-text" style={{ color: theme.text }}>{exp.title}</h4>
                                        <div className="text-sm font-medium opacity-70 mb-2">{exp.company}</div>
                                        <p className="text-sm text-slate-600 leading-relaxed card p-3 bg-white rounded-lg shadow-sm">{exp.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {data.projects && data.projects.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-px bg-slate-300 flex-1"></div>
                            <h3 className="text-center font-bold uppercase tracking-widest text-sm theme-primary" style={{ color: theme.primary }}>Projects</h3>
                            <div className="h-px bg-slate-300 flex-1"></div>
                        </div>
                        <div className="space-y-4">
                            {data.projects.map((proj, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                    <h4 className="font-bold text-md theme-primary" style={{ color: theme.primary }}>{proj.title}</h4>
                                    <p className="text-sm text-slate-600 mt-1">{proj.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                <div className="grid grid-cols-2 gap-8">
                    {data.education && data.education.length > 0 && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                            <h3 className="font-bold uppercase text-xs tracking-widest mb-4 theme-accent" style={{ color: theme.accent }}>Education</h3>
                            <div className="space-y-4">
                                {data.education.map((edu, idx) => (
                                    <div key={idx} className="border-l-2 theme-border-accent pl-3" style={{ borderColor: theme.accent }}>
                                        <div className="font-bold text-sm">{edu.degree}</div>
                                        <div className="text-xs opacity-70">{edu.school}</div>
                                        <div className="text-xs opacity-50 mt-1">{edu.year}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {data.skills && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                            <h3 className="font-bold uppercase text-xs tracking-widest mb-4 theme-accent" style={{ color: theme.accent }}>Skills</h3>
                            <p className="text-sm leading-7">{data.skills}</p>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-8 mt-6">
                    {data.certifications && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                            <h3 className="font-bold uppercase text-xs tracking-widest mb-4 theme-accent" style={{ color: theme.accent }}>Certifications</h3>
                            <p className="text-sm leading-7">{data.certifications}</p>
                        </div>
                    )}
                    {data.involvement && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                            <h3 className="font-bold uppercase text-xs tracking-widest mb-4 theme-accent" style={{ color: theme.accent }}>Involvement</h3>
                            <p className="text-sm leading-7">{data.involvement}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
