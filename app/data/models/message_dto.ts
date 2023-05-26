export enum MessageType {
    USER,
    SYSTEM
}

export interface MessageDto {
    text: string,
    timestamp: number,
    type: MessageType,
}