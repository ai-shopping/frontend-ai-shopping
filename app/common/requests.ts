import { ACCESS_TOKEN, AUTH_PENDDING, PHONE_NUMBER, REFRESH_TOKEN } from "~/common/storage_keys"
import { AUTH_URL } from "~/lib/const"


interface HeadersItem {
    "Content-Type": string
    "Authorization"?: string
}

async function refresh_token(onComplete: Function) {
    if(localStorage.getItem(AUTH_PENDDING) === null){
        localStorage.setItem(AUTH_PENDDING, "true")
        await POST(`${AUTH_URL}/refresh-token?refreshToken=${localStorage.getItem(REFRESH_TOKEN)}`, { 'refreshToken': localStorage.getItem(REFRESH_TOKEN) }, true)
        .then(async (r) => {
            var data: any = await r?.json()
    
            localStorage.setItem(PHONE_NUMBER, data.phone_number)
            localStorage.setItem(ACCESS_TOKEN, data.access_Token)
            localStorage.setItem(REFRESH_TOKEN, data.refresh_Token)
            localStorage.removeItem(AUTH_PENDDING)
            onComplete()
        }).catch((r) => {
            localStorage.removeItem(PHONE_NUMBER)
            localStorage.removeItem(ACCESS_TOKEN)
            localStorage.removeItem(REFRESH_TOKEN)
            location.reload()
            localStorage.removeItem(AUTH_PENDDING)


        })
    }
}

export async function POST<D>(url: string, data: D, is_private = false) {
    var headers: HeadersItem = {
        "Content-Type": "application/json",
    }

    if (is_private) {
        headers.Authorization = `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`
    }

    var response = await fetch(url, {
        method: "POST",
        headers: { ...headers },
        body: JSON.stringify(data),

    })

    if (response.status === 401 || response.status === 403) {

        refresh_token(() => {
            POST<D>(url, data, is_private)
        })
        return null
    }

    return response
}


export async function GET(url: string, is_private = false,) {

    var headers: HeadersItem = {
        "Content-Type": "application/json",
    }

    if (is_private) {
        headers.Authorization = `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`
    }

    if (localStorage.getItem(AUTH_PENDDING)) {
        return
    }


    var response = await fetch(url, {
        headers: { ...headers },
    })
    
    
    
    if (response.status === 401 || response.status === 403) {
        
        refresh_token(() => {
            GET(url, is_private)
        })
        return null
    }

    return response
}

export async function PUT<D>(url: string, data: D, is_private = false) {

    var headers: HeadersItem = {
        "Content-Type": "application/json",
    }

    if (is_private) {
        headers.Authorization = `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`
    }

    if (localStorage.getItem(AUTH_PENDDING)) {
        return
    }


    var response = await fetch(url, {
        method: "PUT",
        headers: { ...headers },
        body: JSON.stringify(data)
    })

    if (response.status === 401 || response.status === 403) {
        refresh_token(() => {
            PUT<D>(url, data, is_private)
        })
        return null
    }


    return response
}

export async function DELETE<D>(url: string, data: D, is_private = false) {

    var headers: HeadersItem = {
        "Content-Type": "application/json",
    }

    if (is_private) {
        headers.Authorization = `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`
    }

    if (localStorage.getItem(AUTH_PENDDING)) {
        return
    }


    var response = await fetch(url, {
        method: "DELETE",
        headers: { ...headers },
        body: JSON.stringify(data)
    })

    if (response.status === 401 || response.status === 403) {
        refresh_token(() => {
            DELETE<D>(url, data, is_private)
        })
        return null
    }


    return response
}
