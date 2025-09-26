import { OpenStreetMapService } from "~/server/services/OpenStreetMapService";

export default defineEventHandler(async (event) => {
    const query = getQuery(event)

    const search = query.search as string
    if (typeof search !== 'string' || !search) {
        return {
        statusCode: 400,
        message: 'Parâmetro "search" é obrigatório e deve ser uma string.',
        };
    }
    const openStreetMapService = new OpenStreetMapService();
    const url = openStreetMapService.getUrl(search);
    return url;
})