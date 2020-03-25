import React, { PureComponent } from 'react';
import Button from 'react-bootstrap/Button';
import Gauge from 'react-svg-gauge';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import $ from 'jquery'; 

// import { DataSourceApi } from '@grafana/data';
// import { getDataSourceSrv } from '@grafana/runtime';

// import find from 'lodash/find';

interface Props extends PanelProps<SimpleOptions> {}

export class SimplePanel extends PureComponent<Props> {

  render() {
    const { options, data, width, height } = this.props;
    let finalVal: any = 0;
    let zeroVal: any = 0;
  
    console.log("data", data);
    console.log("options", options);

    function setZero() {
      let currVal = data.series[1].fields[0].values.toArray().slice(-1)[0] - zeroVal;
      $.ajax({
        method: "POST",
        url: 'http://localhost:8086/write?db=DASH',
        data: "zero_constant value=" + currVal,
        success: function(data){
          console.log("AJAX Success");
        },
        error: function (err) {
          console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
        }
      })
    }

    function getZero() {

      if (Array.isArray(data.series) && data.series.length){
        zeroVal = data.series[0].fields[0].values.toArray().slice(-1)[0] ;
        console.log(zeroVal);
      } else {
        console.log('data not avaliable');
        zeroVal = 0;
      }
      return zeroVal;
    }

    zeroVal = getZero();

    if (Array.isArray(data.series) && data.series.length){
      console.log('zero', zeroVal);
      console.log('Slew Ring', data.series[1].fields[0].values.toArray().slice(-1)[0])

      finalVal =  data.series[1].fields[0].values.toArray().slice(-1)[0]  - zeroVal;
      finalVal = (parseFloat(finalVal)).toFixed(3);
    } else {
      console.log("cannot find slew ring datapoint");
    }
    
    console.log('final', finalVal);

    return (
      <div
        style={{
          position: 'relative',
          width,
          height,
        }}
      >
        <Gauge value={finalVal} width={width/1.1} height={height/1.3} label="" min={0} max={8}/>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            padding: '10px',
          }}
        >
          <div>
            <Button variant="primary" onClick={setZero} size="lg" block>
              Zero
            </Button>
          </div>
        <div>Current Zero Calibration Value: {zeroVal}</div>
        </div>
      </div>
    );
  }
}