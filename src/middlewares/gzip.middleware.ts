import { Request, Response, NextFunction } from "express";
import zlib from "zlib";

export const gzipMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const acceptEncoding = req.headers["accept-encoding"] || "";
  if (!acceptEncoding.includes("gzip")) {
    return next();
  }

  res.setHeader("Content-Encoding", "gzip");

  const gzip = zlib.createGzip();
  const originalWrite = res.write.bind(res);
  const originalEnd = res.end.bind(res);

  (res as any).write = (
    chunk: any,
    encoding?: BufferEncoding,
    callback?: (error: Error | null | undefined) => void
  ): boolean => {
    if (typeof encoding === "function") {
      callback = encoding;
      encoding = "utf8" as BufferEncoding;
    }
    return gzip.write(chunk, encoding, callback);
  };

  (res as any).end = (chunk?: any, encoding?: BufferEncoding | (() => void), callback?: () => void): void => {
    if (typeof encoding === "function") {
      callback = encoding;
      encoding = "utf8" as BufferEncoding;
    }
    gzip.end(chunk, encoding as BufferEncoding, callback as () => void);
  };

  gzip.on("data", (chunk) => originalWrite(chunk));
  gzip.on("end", () => originalEnd());

  next();
};
