import { IColorRGB, IOriginalPixelCluster, IPosition2D, IReplacementPixel } from "./interfaces";

export class DifferencesExtractor {

    private readonly BMP_BUFFER_OFFSET_WIDTH:   number =  18;
    private readonly BMP_BUFFER_OFFSET_HEIGHT:  number =  22;
    private readonly BMP_HEADER_SIZE:           number =  54;

    private readonly BMP_RED_OFFSET:            number =   2;
    private readonly BMP_GREEN_OFFSET:          number =   1;
    private readonly BMP_BLUE_OFFSET:           number =   0;

    private readonly PIXEL_24BIT_BYTESIZE:      number =   3;

    private readonly COLOR_TO_IGNORE:           number = 255;

    // private originalPixelClusters: IOriginalPixelCluster[];
    private originalPixelClusters: Map<number, IOriginalPixelCluster>;

    public constructor() {
        this.originalPixelClusters = new Map<number, IOriginalPixelCluster>();
     }

    public extractPixelClustersFrom(originalImage: Buffer, differenceImage: Buffer):  Map<number, IOriginalPixelCluster> {
        for (let offset: number = this.BMP_HEADER_SIZE; offset < differenceImage.length; offset += this.PIXEL_24BIT_BYTESIZE) {
            const colorCodeFound: number = differenceImage[offset];

            if (colorCodeFound !== this.COLOR_TO_IGNORE) {
                const position:             IPosition2D         = this.getPositionFromOffset(offset, differenceImage);
                const color:                IColorRGB           = this.getPixelOriginalColor(offset, originalImage);
                const replacementPixel:     IReplacementPixel   = this.buildReplacementPixel(position, color);

                let pixelCluster: IOriginalPixelCluster | undefined = this.originalPixelClusters.get(colorCodeFound);

                if (pixelCluster !== undefined) {
                    pixelCluster.cluster.push(replacementPixel);
                } else {
                    pixelCluster = {
                        differenceKey: colorCodeFound,
                        cluster: [replacementPixel],
                    };
                    this.originalPixelClusters.set(colorCodeFound, pixelCluster);
                }
            }
        }

        return this.originalPixelClusters;
    }

    private buildReplacementPixel(position: IPosition2D, color: IColorRGB): IReplacementPixel {
        return {
            position: position,
            color: color,
        };
    }

    private getPositionFromOffset(bufferOffset: number, differenceBuffer: Buffer): IPosition2D {
        const pixelOffset:  number = Math.floor((bufferOffset  - this.BMP_HEADER_SIZE) / this.PIXEL_24BIT_BYTESIZE);
        const reversedPosY: number = Math.floor(pixelOffset / this.getImageWidth(differenceBuffer));
        const posY:         number = (this.getImageHeight(differenceBuffer) - 1) - reversedPosY;
        const posX:         number = (pixelOffset) % this.getImageWidth(differenceBuffer);

        return {
            x: posX,
            y: posY,
        };
    }

    private getPixelOriginalColor(bufferOffset: number, originalImage: Buffer): IColorRGB {
        return {
            R: originalImage[bufferOffset + this.BMP_RED_OFFSET ],
            G: originalImage[bufferOffset + this.BMP_GREEN_OFFSET ],
            B: originalImage[bufferOffset + this.BMP_BLUE_OFFSET ],
        };
    }

    private getImageWidth(buffer: Buffer): number {
        return buffer.readInt32LE(this.BMP_BUFFER_OFFSET_WIDTH);
    }

    private getImageHeight(buffer: Buffer): number {
        return buffer.readInt32LE(this.BMP_BUFFER_OFFSET_HEIGHT);
    }

    private findBottomRightPosition(differenceIndex: number): IPosition2D {

        const maxPosition: IPosition2D = {
            x: 0,
            y: 0,
        };

        this.originalPixelsByGroups[differenceIndex].forEach((pixelInfo: IOriginalPixelsFound) => {
            maxPosition.x = (pixelInfo.position.x > maxPosition.x) ? pixelInfo.position.x : maxPosition.x;
            maxPosition.y = (pixelInfo.position.y > maxPosition.y) ? pixelInfo.position.y : maxPosition.y;
        });

        return maxPosition;
    }

    private findTopLeftPosition(differenceIndex: number): IPosition2D {

        const minPosition: IPosition2D = {
            x: Number.MAX_SAFE_INTEGER,
            y: Number.MAX_SAFE_INTEGER,
        };

        this.originalPixelsByGroups[differenceIndex].forEach((pixelInfo: IOriginalPixelsFound) => {
            minPosition.x = (pixelInfo.position.x < minPosition.x) ? pixelInfo.position.x : minPosition.x;
            minPosition.y = (pixelInfo.position.y < minPosition.y) ? pixelInfo.position.y : minPosition.y;
        });

        return minPosition;
    }

    private createBufferFromDifferences(pixelsInfo: IOriginalPixelsFound[], topLeftPos: IPosition2D, bottomRightPos: IPosition2D): Buffer {
        const isADifferenceAlpha:   number = 255;
        const alphaOffset:          number = 3;
        const bytesPerPixel:        number = 4;
        const widthInPixels:        number = bottomRightPos.x - topLeftPos.x;
        const heightInPixels:       number = bottomRightPos.y - topLeftPos.y;
        const totalBufferLenght:    number = widthInPixels * heightInPixels * bytesPerPixel;

        const diffBuffer: Buffer = Buffer.allocUnsafe(totalBufferLenght).fill(0);

        pixelsInfo.forEach((pixel: IOriginalPixelsFound) => {
            const recenteredPosition: IPosition2D = {
                x: pixel.position.x - topLeftPos.x,
                y: pixel.position.y - topLeftPos.y,
             };
            const positionInBuffer: number = bytesPerPixel * (recenteredPosition.x + recenteredPosition.y * widthInPixels);

            for (let colorOffset: number = 0; colorOffset < pixel.color.length; colorOffset++) {
                diffBuffer[positionInBuffer + colorOffset] = pixel.color[colorOffset];
            }
            diffBuffer[positionInBuffer + alphaOffset] = isADifferenceAlpha;
        });

        return diffBuffer;
    }
}
