// netlify/functions/health.js
// Endpoint: /.netlify/functions/health
//
// Lê o ficheiro JSON mais recente da pasta "Health Auto Export" no Google Drive.
//
// Configuração necessária (Netlify → Environment variables):
//   GOOGLE_SERVICE_ACCOUNT_JSON = JSON da conta de serviço Google (Drive API ativada,
//                                  com acesso de leitura à pasta partilhada)
//   HEALTH_DRIVE_FOLDER_ID = ID da pasta "Health Auto Export" (vês isto no URL da pasta no Drive)
//
// Guia rápido para criar a conta de serviço:
// 1. console.cloud.google.com → cria projeto → ativa "Google Drive API"
// 2. Credentials → Create Credentials → Service Account
// 3. Gera uma chave JSON, copia o conteúdo todo para a variável de ambiente acima
// 4. Partilha a pasta "Health Auto Export" no Drive com o email da conta de serviço (fica no JSON, campo client_email)

import { google } from 'googleapis';

export async function handler() {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    const folderId = process.env.HEALTH_DRIVE_FOLDER_ID;

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    const list = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='text/json'`,
      orderBy: 'createdTime desc',
      pageSize: 2,
      fields: 'files(id, name, createdTime)',
    });

    const files = list.data.files || [];
    if (files.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Nenhum ficheiro encontrado na pasta.' }) };
    }

    const results = await Promise.all(
      files.map(async (f) => {
        const content = await drive.files.get({ fileId: f.id, alt: 'media' });
        return { name: f.name, data: content.data };
      })
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: results }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
