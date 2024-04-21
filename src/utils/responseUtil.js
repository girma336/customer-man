export const sendSuccess = (res, message, data='') => {
    res.status(200).json({
        status: "success",
        message,
        data,
    });
};

export const sendCreatSuccess = (res, message, data='') => {
    res.status(201).json({
        status: "success",
        message,
        data,
    });
};

export const sendToken = (res, token) => {
    res.status(200).json({
      status: "success",
      api_token: token
    });
};

export const sendFildReq = (res, message) => {
    res.status(400).json({
      status: "success",
      message,
    });
};
export const sendForbidden = (res, message, data='') => {
    res.status(403).json({
      status: "fail",
      message,
      data,
    });
};
  
export const sendUnauthorized = (res, data='') => {
    res.status(401).json({
      status: "fail",
      message: "Resource Protected by Authentication",
      data,
    });
};
  
export const sendNotFound = (res, message, data='') => {
    res.status(404).json({
      status: "fail",
      message,
      data,
    });
};

export const sendBadRequest = async (res, message, data='') => {
    res.status(500).json({
      status: "fail",
      message,
      data,
    });
};