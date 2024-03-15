import QRcode from "qrcode-svg";
function mappingNum(x: number) {
  return ((x * 340.3) / 120).toString();
}
function decimalToBinary(n: number, bits: number) {
  let binary = Number(n).toString(2);
  while (binary.length < bits) {
    binary = "0" + binary;
  }
  return binary;
}

export default function createSVGs({
  text,
  num,
  info,
}: {
  text: string;
  num: number;
  info: string;
}) {
  const splitedText = [...new Set(text.split(""))];
  let result = [];
  // split splitedText by 100
  for (let i = 0; i < splitedText.length; i += 100) {
    result.push(
      createSVG({
        text: splitedText.slice(i, i + 100),
        page: i / 100 + 1,
        totalPage: Math.ceil(splitedText.length / 100),
        num,
        info,
      })
    );
  }
  return result;
}
export function createSVG({
  text,
  page,
  totalPage,
  num,
  info,
}: {
  text: string[];
  page: number;
  totalPage: number;
  num: number;
  info: string;
}) {
  // Create an SVG element
  const svgns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgns, "svg");
  svg.setAttribute("viewBox", "0 0 595.44 841.68");
  svg.setAttribute(
    "style",
    `font-family: PMingLiU, "LiSong Pro", NSimSun, "Apple LiSung Light", "Noto Serif TC", "Noto Serif JP", serif; font-weight: 400;`
  );

  // draw QR code
  let qrcodeSvgString = new QRcode({
    content: page.toString(),
    background: "transparent",
  }).svg();
  let qrcodeSvg = new DOMParser().parseFromString(
    qrcodeSvgString,
    "image/svg+xml"
  ).documentElement;
  const qrcodeSize = `65`;
  qrcodeSvg.setAttribute("x", `498`);
  qrcodeSvg.setAttribute("y", `772`);
  qrcodeSvg.setAttribute("width", qrcodeSize);
  qrcodeSvg.setAttribute("height", qrcodeSize);
  qrcodeSvg.setAttribute("viewBox", "0 0 256 256");
  svg.appendChild(qrcodeSvg);

  let title = document.createElementNS(svgns, "text");
  title.setAttribute("x", mappingNum(120));
  title.setAttribute("y", mappingNum(7));
  title.setAttribute("font-size", "12.5");
  title.setAttribute("fill", "black");
  title.textContent = "字體設計與文字編碼";
  svg.appendChild(title);

  let studentInfo = document.createElementNS(svgns, "text");
  studentInfo.setAttribute("x", mappingNum(70));
  studentInfo.setAttribute("y", mappingNum(7));
  studentInfo.setAttribute("font-size", "12.5");
  studentInfo.setAttribute("fill", "black");
  studentInfo.textContent = info;
  svg.appendChild(studentInfo);

  let pageNumber = document.createElementNS(svgns, "text");
  pageNumber.setAttribute("x", mappingNum(175));
  pageNumber.setAttribute("y", mappingNum(7));
  pageNumber.setAttribute("font-size", "12.5");
  pageNumber.setAttribute("fill", "black");
  pageNumber.textContent = `第 ${page}/${totalPage} 頁`;
  svg.appendChild(pageNumber);

  {
    let text = document.createElementNS(svgns, "text");
    text.setAttribute("x", mappingNum(10));
    text.setAttribute("y", mappingNum(8));
    text.style.fontSize = "17px";
    text.textContent = `字順 ${(page - 1) * 100 + 1}-${page * 100}`;
    svg.append(text);
  }
  //
  // 頁碼
  //
  {
    {
      // Create a text element
      let text = document.createElementNS(svgns, "text");
      text.setAttribute("x", mappingNum(88));
      text.setAttribute("y", mappingNum(285));
      text.style.fontSize = "11px";
      text.textContent = "頁碼";
      svg.append(text);

      let rect = document.createElementNS(svgns, "rect");
      rect.setAttribute("x", mappingNum(98));
      rect.setAttribute("y", mappingNum(279));
      rect.setAttribute("width", mappingNum(58));
      rect.setAttribute("height", mappingNum(9));
      rect.setAttribute("stroke", "black");
      rect.setAttribute("fill", "none");
      svg.appendChild(rect);

      let pageNum = document.createElementNS(svgns, "text");
      pageNum.setAttribute("x", mappingNum(158));
      pageNum.setAttribute("y", mappingNum(285));
      pageNum.setAttribute("font-size", "11");
      pageNum.setAttribute("fill", "black");
      pageNum.textContent = page.toString();
      svg.appendChild(pageNum);
    }
    // Decimal to binary
    let binaries = decimalToBinary(page, 8);
    // Draw rectangles for each bit
    for (let j = 0; j < binaries.length; j++) {
      let isFilled = binaries[j] === "1";
      let rect = document.createElementNS(svgns, "rect");
      rect.setAttribute("x", mappingNum(100 + 7 * j));
      rect.setAttribute("y", mappingNum(281));
      rect.setAttribute("width", mappingNum(5));
      rect.setAttribute("height", mappingNum(5));
      rect.setAttribute("stroke", "black");
      rect.setAttribute("fill", isFilled ? "black" : "none");
      svg.appendChild(rect);
    }
  }
  //
  // 編號
  //
  {
    {
      // Create a text element
      let text = document.createElementNS(svgns, "text");
      text.setAttribute("x", mappingNum(8));
      text.setAttribute("y", mappingNum(285));
      text.style.fontSize = "11px";
      text.textContent = "編號";
      svg.append(text);

      // Create a rectangle
      let rect = document.createElementNS(svgns, "rect");
      rect.setAttribute("x", mappingNum(18));
      rect.setAttribute("y", mappingNum(279));
      rect.setAttribute("width", mappingNum(58));
      rect.setAttribute("height", mappingNum(9));
      rect.setAttribute("stroke", "black");
      rect.setAttribute("fill-opacity", "0");
      svg.append(rect);
    }
    // Decimal to binary
    let binaries = decimalToBinary(num, 8);
    // Draw rectangles for each bit
    for (let j = 0; j < binaries.length; j++) {
      let isFilled = binaries[j] === "1";
      let rect = document.createElementNS(svgns, "rect");
      rect.setAttribute("x", mappingNum(20 + 7 * j));
      rect.setAttribute("y", mappingNum(281));
      rect.setAttribute("width", mappingNum(5));
      rect.setAttribute("height", mappingNum(5));
      rect.setAttribute("stroke", "black");
      rect.setAttribute("fill", isFilled ? "black" : "none");
      svg.appendChild(rect);
    }
    {
      // Create a text element
      let text = document.createElementNS(svgns, "text");
      text.setAttribute("x", mappingNum(78));
      text.setAttribute("y", mappingNum(285));
      text.style.fontSize = "11px";
      text.textContent = num.toString();
      svg.append(text);
    }
  }
  {
    function range(start: number, end: number, step = 1) {
      var output = [];
      for (var i = start; i < end; i += step) {
        output.push(i);
      }
      return output;
    }

    // Constants
    const X = range(7.5, 192.5, 20);
    const Y = range(21, 281, 26);
    for (let j = 0; j < 10; j++) {
      for (let i = 0; i < 10; i++) {
        // Create rectangle
        const rect = document.createElementNS(svgns, "rect");
        rect.setAttribute("x", mappingNum(X[i]));
        rect.setAttribute("y", mappingNum(Y[j]));
        rect.setAttribute("width", mappingNum(15));
        rect.setAttribute("height", mappingNum(15));
        rect.setAttribute("stroke", "#000000");
        rect.setAttribute("fill", "#ffffff");
        svg.append(rect);
        {
          const line1 = document.createElementNS(svgns, "line");
          line1.setAttribute("x1", mappingNum(X[i] + 0.5));
          line1.setAttribute("y1", mappingNum(Y[j] - 7.5));
          line1.setAttribute("x2", mappingNum(X[i] + 2));
          line1.setAttribute("y2", mappingNum(Y[j] - 7.5));
          line1.setAttribute("stroke", "#000000");
          line1.setAttribute("stroke-width", `0.4`);
          svg.append(line1);
        }
        {
          const line2 = document.createElementNS(svgns, "line");
          line2.setAttribute("x1", mappingNum(X[i] + 5));
          line2.setAttribute("y1", mappingNum(Y[j] - 7.5));
          line2.setAttribute("x2", mappingNum(X[i] + 6.5));
          line2.setAttribute("y2", mappingNum(Y[j] - 7.5));
          line2.setAttribute("stroke", "#000000");
          line2.setAttribute("stroke-width", `0.4`);
          svg.append(line2);
        }
        {
          const line3 = document.createElementNS(svgns, "line");
          line3.setAttribute("x1", mappingNum(X[i] + 0.5));
          line3.setAttribute("y1", mappingNum(Y[j] - 1.5));
          line3.setAttribute("x2", mappingNum(X[i] + 2));
          line3.setAttribute("y2", mappingNum(Y[j] - 1.5));
          line3.setAttribute("stroke", "#000000");
          line3.setAttribute("stroke-width", `0.4`);
          svg.append(line3);
        }
        {
          const line4 = document.createElementNS(svgns, "line");
          line4.setAttribute("x1", mappingNum(X[i] + 5));
          line4.setAttribute("y1", mappingNum(Y[j] - 1.5));
          line4.setAttribute("x2", mappingNum(X[i] + 6.5));
          line4.setAttribute("y2", mappingNum(Y[j] - 1.5));
          line4.setAttribute("stroke", "#000000");
          line4.setAttribute("stroke-width", `0.4`);
          svg.append(line4);
        }
        // h
        {
          const line5 = document.createElementNS(svgns, "line");
          line5.setAttribute("x1", mappingNum(X[i] + 0.5));
          line5.setAttribute("y1", mappingNum(Y[j] - 7.5));
          line5.setAttribute("x2", mappingNum(X[i] + 0.5));
          line5.setAttribute("y2", mappingNum(Y[j] - 6));
          line5.setAttribute("stroke", "#000000");
          line5.setAttribute("stroke-width", `0.4`);
          svg.append(line5);
        }
        {
          const line6 = document.createElementNS(svgns, "line");
          line6.setAttribute("x1", mappingNum(X[i] + 0.5));
          line6.setAttribute("y1", mappingNum(Y[j] - 3));
          line6.setAttribute("x2", mappingNum(X[i] + 0.5));
          line6.setAttribute("y2", mappingNum(Y[j] - 1.5));
          line6.setAttribute("stroke", "#000000");
          line6.setAttribute("stroke-width", `0.4`);
          svg.append(line6);
        }
        {
          const line7 = document.createElementNS(svgns, "line");
          line7.setAttribute("x1", mappingNum(X[i] + 6.5));
          line7.setAttribute("y1", mappingNum(Y[j] - 7.5));
          line7.setAttribute("x2", mappingNum(X[i] + 6.5));
          line7.setAttribute("y2", mappingNum(Y[j] - 6));
          line7.setAttribute("stroke", "#000000");
          line7.setAttribute("stroke-width", `0.4`);
          svg.append(line7);
        }
        {
          const line8 = document.createElementNS(svgns, "line");
          line8.setAttribute("x1", mappingNum(X[i] + 6.5));
          line8.setAttribute("y1", mappingNum(Y[j] - 3));
          line8.setAttribute("x2", mappingNum(X[i] + 6.5));
          line8.setAttribute("y2", mappingNum(Y[j] - 1.5));
          line8.setAttribute("stroke", "#000000");
          line8.setAttribute("stroke-width", `0.4`);
          svg.append(line8);
        }
      }

      // Create line for each j
      const linej = document.createElementNS(svgns, "line");
      linej.setAttribute("x1", mappingNum(5));
      linej.setAttribute("y1", mappingNum(Y[j] + 16.5));
      linej.setAttribute("x2", mappingNum(205));
      linej.setAttribute("y2", mappingNum(Y[j] + 16.5));
      linej.setAttribute("stroke", "#000000");
      linej.setAttribute("stroke-width", mappingNum(0.3));
      linej.setAttribute("stroke-opacity", `0.4`);
      svg.append(linej);
    }
  }
  {
    let index = 0;
    let count = 0;
    let TOTAL_COUNT = 100; // Just an example. Replace with your actual total count.
    let texts = text;
    // Fill this with actual unicode strings
    // let fnip = []; // Not sure what this is in your code, initialize according to your needs.

    const X = Array.from({ length: 10 }, (_, i) => 7.5 + i * 20);
    const Y = Array.from({ length: 11 }, (_, i) => 21 + i * 26);

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (i * 10 + j >= text.length) break;
        if (count >= TOTAL_COUNT) {
          // Create empty text element
          let text = document.createElementNS(svgns, "text");
          text.setAttribute("x", mappingNum(X[j]));
          text.setAttribute("y", mappingNum(Y[i] - 2));
          text.style.fontSize = "15px";
          text.textContent = "";
          svg.append(text);
        } else {
          let text = document.createElementNS(svgns, "text");
          text.setAttribute("x", mappingNum(X[j] + 1));
          text.setAttribute("y", mappingNum(Y[i] - 3));
          text.style.fontSize = "14px";
          text.style.lineHeight = "14px";

          // Convert unicode to string and add it to the text
          let decodedUnicode = texts[count];
          text.textContent = decodedUnicode;

          let smallText = document.createElementNS(svgns, "text");
          smallText.setAttribute("x", mappingNum(X[j] + 8.5));
          smallText.setAttribute("y", mappingNum(Y[i] - 3));
          smallText.style.fontSize = "8px";
          smallText.textContent = (
            `0000` + texts[count].charCodeAt(0).toString(16).toUpperCase()
          ).slice(-4);
          svg.append(text);
          svg.append(smallText);

          index += 1;
        }
        count += 1;
      }
    }
  }
  return svg;
}
