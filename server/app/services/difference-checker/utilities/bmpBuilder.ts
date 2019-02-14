export class BMPBuilder {

    private readonly BASE_HEADER_SIZE: number = 14;
    private readonly INFOHEADER_SIZE: number = 40;

    private readonly HEADER_SIGNATURE: number = 0x424D; // BM in ascii
    private readonly HEADER_RESERVED: number = 0;       // unused => 0
    private readonly HEADER_DATAOFFSET: number = 54;
    private readonly PLANES: number  = 1;
    private readonly COMPRESSION: number  = 0;
    private readonly HORIZONTAL_RESOLUTION: number  = 2835;
    private readonly VERTICAL_RESOLUTION: number  = 2835;
    private readonly COLOR_USED: number  = 0;
    private readonly IMPORTANT_COLOR_USED: number  = 0;
    // private readonly TOTAL_HEADER_SIZE: number = 54;

    private readonly BYTE_SPAN_2: number = 2;
    private readonly BYTE_SPAN_4: number = 4;
    private readonly BITDEPTH_24: number = 24;
    private readonly NUM_BITS_IN_BYTE: number = 8;
    private readonly BASE_HEXA: number = 16;

    private readonly BLUE_OFFSET:  number = 0;
    private readonly GREEN_OFFSET: number = 1;
    private readonly RED_OFFSET:   number = 2;
    private readonly MIN_ENTRY: number  = 0;
    private readonly MAX_ENTRY: number  = 255;

    private buffer: Buffer;

}
