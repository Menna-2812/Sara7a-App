import { WHITE_LIST } from "../../../config/config.service.js";

export function corsOptions() {
  const whiteList = WHITE_LIST.split(",");
  const corsOptions = {
    origin: function (origin, callback) {
      if (whiteList.includes(origin)) {
        callback(null, true);
      } else if (!origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  };
  return corsOptions;
}
