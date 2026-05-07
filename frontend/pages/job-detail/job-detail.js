const { get } = require('../../utils/api');

Page({
  data: {
    jobId: 0,
    job: null,
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ jobId: parseInt(options.id) });
      this.loadJob();
    }
  },

  async loadJob() {
    try {
      const data = await get(`/data/jobs/${this.data.jobId}`);
      this.setData({ job: data, loading: false });
    } catch (err) {
      this.setData({ loading: false });
    }
  }
});
