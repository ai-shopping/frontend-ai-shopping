import { getLocalStorageData, setLocalStorageData } from "~/common/helper";
import { POST } from "~/common/requests";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "~/common/storage_keys";
import AuthResponseDto from "~/data/models/auth_response_dto";
import { BOT_URL, STORE_PASSWORD } from "../const";

export async function getAccessToken() {
    if (localStorage.getItem(REFRESH_TOKEN) !== null && localStorage.getItem(REFRESH_TOKEN)!== undefined) {
        let response = await POST(`${BOT_URL}/api/v1/token`,{
            "password": STORE_PASSWORD
        });
    
        if (response?.status === 200) {
            let data = await response.json<AuthResponseDto>();
    
            let mapData = new Map()
            mapData.set(ACCESS_TOKEN,data.access_token)
            mapData.set(REFRESH_TOKEN,data.refresh_token)
            setLocalStorageData(mapData)
    
            return data.access_token;
        }
    }else {
        refreshToken()
    }
}

export async function refreshToken() {
    let storageItems = getLocalStorageData([REFRESH_TOKEN])
    let response = await POST(`${BOT_URL}/api/v1/token/refresh?refresh_token=${storageItems.get(REFRESH_TOKEN)}`, null);

    if (response?.status === 200) {
        let data = await response.json<AuthResponseDto>();
        
        let mapData = new Map()
        mapData.set(ACCESS_TOKEN,data.access_token)
        setLocalStorageData(mapData)

        return data.access_token;
    }
}

