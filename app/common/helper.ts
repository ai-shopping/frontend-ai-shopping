export function setAuthData(data: Map<string,string>) {
    data.forEach((key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    })
}

export function getAuthData(data: string[]):Map<string,string> {
    let items: Map<string,string> = new Map()
    data.forEach((key) => {
        items.set(key, JSON.stringify(localStorage.getItem(key)))
    })

    return items
}