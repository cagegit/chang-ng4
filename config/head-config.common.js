/**
 * Configuration for head elements added during the creation of index.html.
 *
 * All href attributes are added the publicPath (if exists) by default.
 * You can explicitly hint to prefix a publicPath by setting a boolean value to a key that has
 * the same name as the attribute you want to operate on, but prefix with =
 *
 * Example:
 * { name: 'msapplication-TileImage', content: '/assets/icon/ms-icon-144x144.png', '=content': true },
 * Will prefix the publicPath to content.
 *
 * { rel: 'apple-touch-icon', sizes: '57x57', href: 'assets/icon/apple-icon-57x57.png', '=href': false },
 * Will not prefix the publicPath on href (href attributes are added by default
 *
 */
module.exports = {
  script :[
    { type: 'text/javascript', src: 'assets/js/ace.js',async:"async"},
    { type: 'text/javascript', src: 'assets/js/sonic.js',async:"async" },
    { type: 'text/javascript', src: 'assets/js/rgbcolor.js',async:"async" },
    { type: 'text/javascript', src: 'assets/js/StackBlur.js',async:"async" },
    { type: 'text/javascript', src: 'assets/js/canvg.min.js',async:"async" },
    { type: 'text/javascript', src: 'assets/js/html2canvas.min.js',async:"async" },
    { type: 'text/javascript', src: 'assets/js/html2canvas.svg.min.js',async:"async" },
    { type: 'text/javascript', src: 'assets/js/pdfmake.min.js',async:"async" }
  ],
  link: [
        /** <link> tags for favicons **/
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: 'assets/img/favicon.png' },
    { rel: 'icon', type: 'image/png', sizes: '96x96', href: 'assets/img/favicon.png' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: 'assets/img/favicon.png' },

    /** bootstrap **/
    {rel:'stylesheet',type:'text/css',href:'assets/css/bootstrap.min.css'},
    {rel:'stylesheet',type:'text/css',href:'assets/css/bootstrap-theme.min.css'},
    {rel:'stylesheet',type:'text/css',href:'assets/css/iconfont.css'},
    {rel:'stylesheet',type:'text/css',href:'assets/css/dragula.css'}
  ],
/*  meta: [
    { name: 'msapplication-TileColor', content: '#00bcd4' },
    { name: 'msapplication-TileImage', content: 'assets/icon/ms-icon-144x144.png', '=content': true },
    { name: 'theme-color', content: '#00bcd4' }
  ]*/
};
