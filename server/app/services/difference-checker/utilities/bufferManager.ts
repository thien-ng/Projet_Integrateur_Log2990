import { injectable } from "inversify";
import { Constants } from "../../../constants";

const HEADER_SIZE: number =  54; // size in Bytes

@injectable()
export class BufferManager {

    
    public splitHeader(input: Buffer): Buffer[] {

        const jsonBuffer: string = JSON.stringify(input);
        const dataBuffer: Buffer = JSON.parse( jsonBuffer, (key: number, value: any) => {
            return value && value.type === Constants.BUFFER_TYPE ? Buffer.from(value.data) : value;
        });

        const header: Buffer = dataBuffer.slice(0, HEADER_SIZE);
        const image: Buffer = dataBuffer.slice(HEADER_SIZE, input.length);

        const buffers: Buffer[] = [];
        buffers.push(header);
        buffers.push(image);

        return buffers;

    }

    public arrayToBuffer(array: number[]): Buffer {
        let stringBuffer: string = "";
        array.forEach((element: number) => {
            if (element === 0) {
                stringBuffer += Constants.WHITE_PIXEL;
            } else {
                stringBuffer += Constants.BLACK_PIXEL;
            }
        });

        return Buffer.from(stringBuffer, Constants.BUFFER_FORMAT);
    }

    public mergeBuffers(header: Buffer, image: Buffer): Buffer {
        const b: string =  header.toString(Constants.BUFFER_FORMAT) + image.toString(Constants.BUFFER_FORMAT);

        return Buffer.from(b, Constants.BUFFER_FORMAT);
    }

}
