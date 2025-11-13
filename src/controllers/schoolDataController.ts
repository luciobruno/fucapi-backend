import SchoolDataModel, { SchoolData } from "../models/schoolDataModel";


const schoolDataController = {
    create: async (data: SchoolData) => {
        try {
            await SchoolDataModel.createSchoolData(data);
            return 'Registro criado com sucesso';
        } catch (error) {
            throw new Error(error.message ?? 'Erro ao criar registro');
        }
    },
    list: async () => {
        try {
            const results = await SchoolDataModel.listSchoolDatas();
            return results;
        } catch (error) {
            throw new Error(error.message ?? "Não foi possível listar registros");
        }
    },
    listById: async (id: string) => {
        try {
            const result = await SchoolDataModel.getSchoolDataById(id);
            return result;
        } catch (error) {
            throw new Error(error.message ?? 'Erro ao listar registro por e-mail');
        }
    },
    delete: async (id: string) => {
        try {
            await SchoolDataModel.deleteSchoolDataById(id);
            return "Registro excluído com sucesso";
        } catch (error) {
            throw new Error(error.message ?? 'Erro ao deletar registro por e-mail');
        }
    },
    update: async (id: string, data: SchoolData) => {
        try {
            await SchoolDataModel.updateSchoolDataById(id, data);
            return "Registro editado com sucesso";
        } catch (error) {
            throw new Error(error.message ?? 'Erro ao atualizar registro por e-mail');
        }
    }
};

export default schoolDataController;