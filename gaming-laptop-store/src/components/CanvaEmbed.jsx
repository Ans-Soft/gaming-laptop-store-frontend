import React from 'react';
import "../styles/canvaEmbed.css";

const CanvaEmbed = () => {
    // 1. Guarda el código HTML de Canva como una cadena de texto (string)
    const canvaHtml = `
        <div style="position: relative; width: 100%; height: 0; padding-top: 100.0000%;
        padding-bottom: 0; box-shadow: 0 2px 8px 0 rgba(63,69,81,0.16); margin-top: 1.6em; margin-bottom: 0.9em; overflow: hidden;
        border-radius: 8px; will-change: transform;">
            <iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0;margin: 0;"
                src="https://www.canva.com/design/DAG6YGTa7H4/0nReqh1HkoQsa9FJfVJ5gg/view?embed" allowfullscreen="allowfullscreen" allow="fullscreen">
            </iframe>
        </div>
        <a href="https:&#x2F;&#x2F;www.canva.com&#x2F;design&#x2F;DAG6YGTa7H4&#x2F;0nReqh1HkoQsa9FJfVJ5gg&#x2F;view?utm_content=DAG6YGTa7H4&amp;utm_campaign=designshare&amp;utm_medium=embeds&amp;utm_source=link" target="_blank" rel="noopener">Inventario BF</a> de Partes Accesorios
    `;

    // 2. Renderiza el HTML usando la propiedad 'dangerouslySetInnerHTML'
    return (
        <div className="canva-embed-wrapper">

            <div dangerouslySetInnerHTML={{ __html: canvaHtml }} />
        </div>
    );
};

export default CanvaEmbed;