$(document).ready(function() {
  $(function(){
    'use strict'

    var df3data1 = [[0,12],[1,10],[2,7],[3,11],[4,15],[5,20],[6,22],[7,19],[8,18],[9,20],[10,17],[11,19],[12,18],[13,14],[14,9]];
    var df3data2 = [[0,0],[1,0],[2,0],[3,2],[4,5],[5,2],[6,12],[7,15],[8,10],[9,8],[10,10],[11,7],[12,2],[13,4],[14,0]];
    var df3data3 = [[0,2],[1,1],[2,2],[3,4],[4,2],[5,1],[6,0],[7,0],[8,5],[9,2],[10,8],[11,6],[12,9],[13,2],[14,0]];
    var df3data4 = [[0,0],[1,5],[2,2],[3,0],[4,2],[5,7],[6,10],[7,12],[8,8],[9,6],[10,4],[11,2],[12,0],[13,0],[14,0]];

    var flotChartOption1 = {
      series: {
        shadowSize: 0,
        bars: {
          show: true,
          lineWidth: 0,
          barWidth: .5,
          fill: 1
        }
      },
      grid: {
        aboveData: true,
        color: '#e5e9f2',
        borderWidth: 0,
        labelMargin: 0
      },
      yaxis: {
        show: false,
        min: 0,
        max: 25
      },
      xaxis: {
        show: false
      }
    };

    var flotChart3 = $.plot('#flotChart3', [{
      data: df3data1,
      color: '#e5e9f2'
    },{
      data: df3data2,
      color: '#66a4fb'
    }], flotChartOption1);


    var flotChart4 = $.plot('#flotChart4', [{
      data: df3data1,
      color: '#e5e9f2'
    },{
      data: df3data3,
      color: '#7ee5e5'
    }], flotChartOption1);

    var flotChart5 = $.plot('#flotChart5', [{
      data: df3data1,
      color: '#e5e9f2'
    },{
      data: df3data4,
      color: '#f77eb9'
    }], flotChartOption1);


    window.darkMode = function(){
      var f3 = flotChart3.getData();
      f3[0].color = '#3b4863';
      flotChart3.setData(f3);
      flotChart3.setupGrid();
      flotChart3.draw();

      var f4 = flotChart4.getData();
      f4[0].color = '#3b4863';
      flotChart4.setData(f4);
      flotChart4.setupGrid();
      flotChart4.draw();

      var f5 = flotChart5.getData();
      f5[0].color = '#3b4863';
      flotChart5.setData(f5);
      flotChart5.setupGrid();
      flotChart5.draw();

      $('.progress.op-5').removeClass('op-5');
      $('.btn-white').addClass('btn-dark').removeClass('btn-white');
    }

    window.lightMode = function() {
      var f3 = flotChart3.getData();
      f3[0].color = '#e5e9f2';
      flotChart3.setData(f3);
      flotChart3.setupGrid();
      flotChart3.draw();

      var f4 = flotChart4.getData();
      f4[0].color = '#e5e9f2';
      flotChart4.setData(f4);
      flotChart4.setupGrid();
      flotChart4.draw();

      var f5 = flotChart5.getData();
      f5[0].color = '#e5e9f2';
      flotChart5.setData(f5);
      flotChart5.setupGrid();
      flotChart5.draw();

      $('.btn-dark').addClass('btn-white').removeClass('btn-dark');
      $('.progress.op-5').addClass('op-5');
    }

    var hasMode = Cookies.get('df-mode');
    if(hasMode === 'dark') {
      darkMode();
    } else {
      lightMode();
    }

  });
});