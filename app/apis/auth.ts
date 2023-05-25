import { getAuthData, setAuthData } from "~/common/helper";
import { POST } from "~/common/requests";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "~/common/storage_keys";
import AuthResponseDto from "~/data/models/auth_response_dto";

export async function getAccessToken() {
    let response = await POST(`${BOT_URL}/api/v1/token`,{
        "password": STORE_PASSWORD
    });

    if (response?.status === 200) {
        let data = await response.json<AuthResponseDto>();

        let mapData = new Map()
        mapData.set(ACCESS_TOKEN,data.access_token)
        mapData.set(REFRESH_TOKEN,data.refresh_token)
        setAuthData(mapData)

        return data.access_token;
    }
}

export async function refreshToken() {
    let storageItems = getAuthData([REFRESH_TOKEN])
    let response = await POST(`${BOT_URL}/api/v1/token/refresh?refresh_token=${storageItems.get("refresh_token")}`, null);

    if (response?.status === 200) {
        let data = await response.json<AuthResponseDto>();
        return data.access_token;
    }
}

