module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        browsers: ['last 2 versions', 'not dead']
      }
    }],
    ['@babel/preset-react', {
      pragma: 'h',
      pragmaFrag: 'Fragment'
    }]
  ],
  plugins: [
    ['@babel/plugin-transform-react-jsx', {
      pragma: 'h',
      pragmaFrag: 'Fragment'
    }]
  ]
}
