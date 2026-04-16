const lu = require('react-icons/lu');
const icons = [
  'LuShieldCheck', 'LuSearch', 'LuBriefcase', 'LuAlertTriangle',
  'LuCheckCircle', 'LuXCircle', 'LuEye', 'LuMapPin',
  'LuActivity', 'LuFileCheck', 'LuUsers', 'LuClock', 'LuTrendingUp'
];
const missing = icons.filter(i => !lu[i]);
if (missing.length > 0) {
  console.log('Missing:', missing);
} else {
  console.log('All icons exist');
}
