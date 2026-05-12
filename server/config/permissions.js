module.exports = {
  admin: {
    employee:    ['name','email','phone','department','designation','salary','role','status'],
    reward:      ['points','badge','reason','date'],
    attendance:  ['status','checkIn','checkOut','note'],
    performance: ['score','review','month','reviewer'],
    feedback:    ['message','rating','from','to'],
  },
  manager: {
    employee:    ['phone','department','designation','status'],
    reward:      ['points','badge','reason'],
    attendance:  ['status','note'],
    performance: ['score','review'],
    feedback:    ['message','rating'],
  },
  employee: {
    employee:    ['phone','emergencyContact','address','profilePicture'],
    feedback:    ['message','rating'],
  }
};
