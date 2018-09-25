export function latestTime() {
  return global.web3.eth.getBlock("latest").timestamp;
}

export const duration = {
  seconds: function(val) {
    return val;
  },
  minutes: function(val) {
    return val * this.seconds(60);
  },
  hours: function(val) {
    return val * this.minutes(60);
  },
  days: function(val) {
    return val * this.hours(24);
  },
  weeks: function(val) {
    return val * this.days(7);
  },
  months: function(val) {
    return val * this.days(30);
  },
  years: function(val) {
    return val * this.days(365);
  }
};
