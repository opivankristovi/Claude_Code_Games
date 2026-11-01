class V3 {
    constructor(x=0,y=0,z=0) { this.x=x; this.y=y; this.z=z; }
    addScaledVector(v, s) { this.x += v.x*s; this.y += v.y*s; this.z += v.z*s; }
    clone() { return new V3(this.x, this.y, this.z); }
}

function groundH(x,z) { return 0; }

function updParticles_splice(ps,dt,onHit,grav=9.8){
    let n=0;
    for(let i=ps.list.length-1;i>=0;i--){
        const q=ps.list[i];
        q.life-=dt;
        q.v.y-=grav*dt;
        q.p.addScaledVector(q.v,dt);
        const gy=groundH(q.p.x,q.p.z);
        if(q.p.y<gy+0.01){
            if(onHit)onHit(q);
            q.life=0;
        }
        if(q.life<=0){
            ps.list.splice(i,1);
        }
    }
}

function updParticles_swap(ps,dt,onHit,grav=9.8){
    let n=0;
    for(let i=ps.list.length-1;i>=0;i--){
        const q=ps.list[i];
        q.life-=dt;
        q.v.y-=grav*dt;
        q.p.addScaledVector(q.v,dt);
        const gy=groundH(q.p.x,q.p.z);
        if(q.p.y<gy+0.01){
            if(onHit)onHit(q);
            q.life=0;
        }
        if(q.life<=0){
            const last = ps.list.pop();
            if (i < ps.list.length) {
                ps.list[i] = last;
            }
        }
    }
}

function makePS(count) {
    const list = [];
    for (let i = 0; i < count; i++) {
        list.push({
            p: new V3(0, 10, 0),
            v: new V3(0, 0, 0),
            life: Math.random() * 2 // random life up to 2
        });
    }
    return { list };
}

console.log("Measuring Splice:");
let ps_splice = makePS(50000);
let start = performance.now();
// simulate a few frames where particles are dying
for (let j = 0; j < 60; j++) {
    updParticles_splice(ps_splice, 0.016, null);
}
let time_splice = performance.now() - start;
console.log(`Splice took ${time_splice.toFixed(2)}ms`);

console.log("Measuring Swap-and-pop:");
let ps_swap = makePS(50000);
start = performance.now();
// simulate a few frames where particles are dying
for (let j = 0; j < 60; j++) {
    updParticles_swap(ps_swap, 0.016, null);
}
let time_swap = performance.now() - start;
console.log(`Swap-and-pop took ${time_swap.toFixed(2)}ms`);
