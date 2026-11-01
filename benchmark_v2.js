const { performance } = require('perf_hooks');
const THREE = require('three');

function mergeVertices( geometry ) {
  // simple mock
  return geometry;
}

// Current implementation
function blob_old(rx,ry,rz,{p=[0,0,0],r=[0,0,0],e=1,seg=22}={}){
  let g=new THREE.SphereGeometry(1,seg,Math.round(seg*0.75));
  g.deleteAttribute('uv');
  g.deleteAttribute('normal');
  const a=g.attributes.position;
  for(let i=0;i<a.count;i++){
    let x=a.getX(i),y=a.getY(i),z=a.getZ(i);
    if(e!==1){
      x=Math.sign(x)*Math.pow(Math.abs(x),e);
      y=Math.sign(y)*Math.pow(Math.abs(y),e);
      z=Math.sign(z)*Math.pow(Math.abs(z),e);
    }
    a.setXYZ(i,x*rx,y*ry,z*rz);
  }
  g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(r[0],r[1],r[2])));
  g.translate(p[0],p[1],p[2]);
  g.computeVertexNormals();
  return g;
}

// New implementation
const _blobMat = new THREE.Matrix4();
const _blobEuler = new THREE.Euler();

function blob_new(rx,ry,rz,{p=[0,0,0],r=[0,0,0],e=1,seg=22}={}){
  let g=new THREE.SphereGeometry(1,seg,Math.round(seg*0.75));
  g.deleteAttribute('uv');
  g.deleteAttribute('normal');
  const a=g.attributes.position;
  for(let i=0;i<a.count;i++){
    let x=a.getX(i),y=a.getY(i),z=a.getZ(i);
    if(e!==1){
      x=Math.sign(x)*Math.pow(Math.abs(x),e);
      y=Math.sign(y)*Math.pow(Math.abs(y),e);
      z=Math.sign(z)*Math.pow(Math.abs(z),e);
    }
    a.setXYZ(i,x*rx,y*ry,z*rz);
  }
  _blobEuler.set(r[0],r[1],r[2]);
  _blobMat.makeRotationFromEuler(_blobEuler);
  g.applyMatrix4(_blobMat);
  g.translate(p[0],p[1],p[2]);
  g.computeVertexNormals();
  return g;
}


// Warmup
for (let i = 0; i < 1000; i++) {
  blob_old(1, 1, 1);
  blob_new(1, 1, 1);
}

// Measure old
const iters = 10000;
const startOld = performance.now();
for (let i = 0; i < iters; i++) {
  blob_old(1, 1, 1, {r: [0.1, 0.2, 0.3], p: [1, 2, 3]});
}
const endOld = performance.now();
const timeOld = endOld - startOld;

// Measure new
const startNew = performance.now();
for (let i = 0; i < iters; i++) {
  blob_new(1, 1, 1, {r: [0.1, 0.2, 0.3], p: [1, 2, 3]});
}
const endNew = performance.now();
const timeNew = endNew - startNew;

console.log(`Old: ${timeOld.toFixed(2)} ms`);
console.log(`New: ${timeNew.toFixed(2)} ms`);
console.log(`Improvement: ${((timeOld - timeNew) / timeOld * 100).toFixed(2)}%`);
