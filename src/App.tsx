import {useCallback, useEffect, useRef, useState} from 'react'
import './App.css'
import defaultImage from './assets/default.jpg'

function App() {

  const [fontSize, setFontSize] = useState<number>(12);
  const [color, setColor] = useState<boolean>(true);
  const [resolutionMultiplier, setresolutionMultiplier] = useState(1);

  useEffect(() => {
    const img = new Image();
    img.src = defaultImage;
    img.onload = () => {
      imageRef.current = img;
      createAsciiCanvas(img, fontSize, resolutionMultiplier);
    };
  }, []);


  const imageRef = useRef<HTMLImageElement | null>(null);

  const uploadRef = useRef<HTMLInputElement>(null);
  const displayImgRef = useRef<HTMLImageElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const asciiCanvasRef = useRef<HTMLCanvasElement>(null);


  const createAsciiCanvas = useCallback((img: HTMLImageElement, fontSize: number, resolutionMultiplier: number) => {

    const ascii70: string[] = [
      ' ', '.', '\'', '`', '^', '"', ',', ':', ';', 'I', 'l', '!', 'i', '>', '<', '~',
      '+', '_', '-', '?', ']', '[', '}', '{', '1', ')', '(', '|', '\\', '/', 't', 'f',
      'j', 'r', 'x', 'n', 'u', 'v', 'c', 'z', 'X', 'Y', 'U', 'J', 'C', 'L', 'Q', '0',
      'O', 'Z', 'm', 'w', 'q', 'p', 'd', 'b', 'k', 'h', 'a', 'o', '*', '#', 'M', 'W',
      '&', '8', '%', 'B', '@', '$'
    ];

    const displayImg = displayImgRef.current!;
    displayImg.src = img.src;

    const canvas = hiddenCanvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    const asciiCanvas = asciiCanvasRef.current!;
    const asciiCtx = asciiCanvas.getContext('2d')!;


    const charHeight = fontSize;
    const charWidth = fontSize * 0.6;

    const maxCharsPerLine = Math.floor((img.width / charWidth) * resolutionMultiplier);
    const aspectRatio = img.width / img.height;

    const scaledWidth = maxCharsPerLine;
    const scaledHeight = Math.min(
      Math.floor((img.height / charHeight) * resolutionMultiplier),
      Math.floor(scaledWidth / aspectRatio)
    );

    canvas.width = scaledWidth;
    canvas.height = scaledHeight;
    ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

    asciiCanvas.width = scaledWidth * charWidth;
    asciiCanvas.height = scaledHeight * charHeight;
    asciiCtx.fillStyle = '#242424';
    asciiCtx.fillRect(0, 0, asciiCanvas.width, asciiCanvas.height);

    asciiCtx.font = `${charHeight}px monospace`;
    asciiCtx.textBaseline = 'top';

    const imageData = ctx.getImageData(0, 0, scaledWidth, scaledHeight);
    const {data, width, height} = imageData;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3] / 255;

        const luminosity = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const index = Math.floor((luminosity / 255) * (ascii70.length - 1));
        const char = ascii70[index];

        if (color) {
          asciiCtx.fillStyle = `rgba(${r},${g},${b},${a.toFixed(2)})`;
        } else {
          asciiCtx.fillStyle = 'white';
        }
        asciiCtx.fillText(char, x * charWidth, y * charHeight);
      }
    }
  }, [color]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (imageRef.current) {
        createAsciiCanvas(imageRef.current, fontSize, resolutionMultiplier);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [fontSize, color, createAsciiCanvas, resolutionMultiplier]);

  const handleFontSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFontSize(Number(event.target.value));
  };

  const handleResolutionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setresolutionMultiplier(Number(event.target.value));
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      imageRef.current = img;
      createAsciiCanvas(img, fontSize, resolutionMultiplier);
    };
  };

  const handleColorChkBox = () => {
    setColor(prevColor => !prevColor);
  };

  return (
    <div id={"ascii-image-gen"}>
      <div id="left-pane">
        <img id="display-img" src={defaultImage} ref={displayImgRef} alt={"source image"}/>
        <input
          type="file"
          id="upload"
          accept="image/*"
          ref={uploadRef}
          onChange={handleUpload}
        />
        <div id={"input-area"}>
          <label>
            <input
              type="range"
              min="2"
              max="80"
              value={fontSize}
              onChange={handleFontSizeChange}
              className="slider"
              id="myRange"/>
            <span> Font: {fontSize} </span>
          </label>
          <label>
            <input
              type="range"
              min="1"
              max="10"
              value={resolutionMultiplier}
              onChange={handleResolutionChange}
              className="slider"
              id="myRange"/>
            <span> Res Multiplier: {resolutionMultiplier} </span>
          </label>
        </div>
        <label>
          <input
            type="checkbox"
            checked={color}
            onChange={handleColorChkBox}
          />
          Color
        </label>
        <canvas id="hidden-canvas" ref={hiddenCanvasRef} style={{display: 'none'}}></canvas>
      </div>

      <div id="right-pane">
        <canvas id="ascii-canvas" ref={asciiCanvasRef}></canvas>
      </div>
    </div>
  );
}

export default App;
