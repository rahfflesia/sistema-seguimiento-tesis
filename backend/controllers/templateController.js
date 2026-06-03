import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getTemplates = (req, res) => {
    try {
        const templatesDir = path.join(__dirname, '../public/templates');
        
        // Ensure directory exists, if not, create empty response or create dir
        if (!fs.existsSync(templatesDir)) {
            return res.json([]);
        }

        const files = fs.readdirSync(templatesDir);
        
        const templates = files.map((file, index) => {
            const stats = fs.statSync(path.join(templatesDir, file));
            const ext = path.extname(file);
            let category = 'Documento';
            if (ext === '.docx' || ext === '.doc') category = 'Word';
            if (ext === '.xlsx' || ext === '.xls') category = 'Excel';
            if (ext === '.pptx' || ext === '.ppt') category = 'PowerPoint';
            if (ext === '.pdf') category = 'PDF';
            
            return {
                id: index + 1,
                title: file.replace(ext, '').replace(/_/g, ' '),
                category,
                size: (stats.size / 1024).toFixed(2) + ' KB',
                format: ext,
                url: `/public/templates/${file}`,
                description: 'Plantilla oficial de la institución.'
            };
        });

        res.json(templates);
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ message: 'Error al obtener plantillas' });
    }
};
