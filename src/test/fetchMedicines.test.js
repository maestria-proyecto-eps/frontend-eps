import { http } from '../services/api/http';
import { endpoints } from '../services/api/endpoints';

/**
 * Script de prueba para consumir el endpoint de medicamentos del backend
 * Ejecutar: npm test -- fetchMedicines.test.js
 */

describe('Pharmacy API - Medicamentos', () => {
  test('Debe obtener la lista de medicamentos del backend', async () => {
    try {
      console.log('📡 Iniciando llamado al backend...');
      console.log(`🔗 Endpoint: ${endpoints.pharmacy.listMedications}`);

      const response = await http.get(endpoints.pharmacy.listMedications, {
        params: {
          page: 1,
          limit: 10,
        },
      });

      console.log('\n✅ Respuesta del servidor:');
      console.log('Status:', response.status);
      console.log('Data:', JSON.stringify(response.data, null, 2));
      console.log('\n📋 Medicamentos recibidos:');
      if (response.data?.data) {
        response.data.data.forEach((med, index) => {
          console.log(`${index + 1}. ${med.nombre_medicamento} (${med.codigo})`);
        });
      }

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    } catch (error) {
      console.error('\n❌ Error en el llamado:');
      console.error('Status:', error.response?.status);
      console.error('Mensaje:', error.response?.data?.message || error.message);
      console.error('Error completo:', error);
      throw error;
    }
  });
});
