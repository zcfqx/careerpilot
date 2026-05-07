const success = (data = null, message = 'success') => {
  return { code: 200, message, data };
};

const error = (code = 500, message = '服务器内部错误', data = null) => {
  return { code, message, data };
};

const paginate = (list, total, page, pageSize) => {
  return {
    list,
    total,
    page: Number(page),
    pageSize: Number(pageSize)
  };
};

module.exports = { success, error, paginate };
