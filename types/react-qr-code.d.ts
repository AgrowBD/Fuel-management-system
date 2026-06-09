declare module "react-qr-code" {
  import { SVGProps } from "react";
  export interface QRCodeProps extends SVGProps<SVGSVGElement> {
    value: string;
    size?: number;
    level?: "L" | "M" | "Q" | "H";
    bgColor?: string;
    fgColor?: string;
  }
  export default function QRCode(props: QRCodeProps): JSX.Element;
}
