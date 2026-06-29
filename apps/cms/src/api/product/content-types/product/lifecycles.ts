export default {
  beforeCreate(event: any) {
    const { data } = event.params;

    // after creating a new product or duplicating it, we force the views field to start from 0
    event.params.data.views = 0;

    // additional safety line: if the field is not already in the data, we add it with 0
    if (data && typeof data.views !== 'undefined') {
      data.views = 0;
    }
  },
};
