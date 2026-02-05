import { colorThemes, fontThemes, layoutThemes } from "./templateThemes";

export const generateAllPresets = () => {
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

export const allPresets = generateAllPresets();
