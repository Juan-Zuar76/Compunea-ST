// Año
document.addEventListener('DOMContentLoaded', ()=>{
  const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();
});

// Menú hamburguesa
document.addEventListener('DOMContentLoaded', ()=>{
  const btn=document.getElementById('navToggle');
  const drawer=document.getElementById('mainMenu');
  const backdrop=document.getElementById('backdrop');
  if(!btn||!drawer) return;
  const open=()=>{drawer.classList.add('open');backdrop?.classList.add('show');btn.setAttribute('aria-expanded','true');drawer.setAttribute('aria-hidden','false');};
  const close=()=>{drawer.classList.remove('open');backdrop?.classList.remove('show');btn.setAttribute('aria-expanded','false');drawer.setAttribute('aria-hidden','true');};
  btn.addEventListener('click',()=>drawer.classList.contains('open')?close():open());
  backdrop?.addEventListener('click',close);
  window.addEventListener('keydown',e=>{if(e.key==='Escape') close();});
});

// Carrusel
document.addEventListener('DOMContentLoaded', ()=>{
  const root=document.querySelector('.carousel'); if(!root) return;
  const track=root.querySelector('.track');
  const slides=[...root.querySelectorAll('.slide')];
  const prev=root.querySelector('.prev'), next=root.querySelector('.next');
  const dots=root.querySelector('.dots'); if(!prev||!next||slides.length===0) return;
  let i=0, auto=null; dots.innerHTML='';
  slides.forEach((_,k)=>{const b=document.createElement('button');b.type='button';b.onclick=()=>go(k,true);dots.appendChild(b);});
  const render=()=>{slides.forEach((s,k)=>s.classList.toggle('is-active',k===i));[...dots.children].forEach((d,k)=>d.setAttribute('aria-selected',k===i));track.style.transform=`translateX(-${i*100}%)`;};
  const go=(n,stop)=>{i=(n+slides.length)%slides.length;render();if(stop) restart();};
  const step=()=>go(i+1); prev.onclick=()=>go(i-1); next.onclick=step;
  const ms=parseInt(root.dataset.interval||'4500',10);
  const start=()=>{ if(root.dataset.autoplay!=='false') auto=setInterval(step,ms); };
  const stop =()=>{ if(auto){clearInterval(auto);auto=null;} };
  const restart=()=>{stop();start();};
  root.addEventListener('mouseenter',stop); root.addEventListener('mouseleave',start);
  let x0=null; root.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;stop();},{passive:true});
  root.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-x0; if(Math.abs(dx)>40) (dx<0?step:()=>go(i-1))(); start();});
  render(); start();
});

// Revela on scroll
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.revela').forEach(el=>{
    const io=new IntersectionObserver(es=>{
      es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target);}});
    },{threshold:.15});
    io.observe(el);
  });
});
// === ACCORDION (Servicios) ===
document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('.accordion .ac-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      // cerrar todos
      btn.closest('.accordion').querySelectorAll('.ac-btn').forEach(b=>{
        b.setAttribute('aria-expanded','false');
      });
      btn.closest('.accordion').querySelectorAll('.ac-panel').forEach(p=>{
        p.classList.remove('is-open');
      });
      // abrir el elegido si estaba cerrado
      if(!expanded){
        const panel = btn.nextElementSibling;
        btn.setAttribute('aria-expanded','true');
        panel.classList.add('is-open');
      }
    });
  });
});

// === MODAL (Contacto) ===
document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('contactForm');
  const modal = document.getElementById('okModal');
  if(!form || !modal) return;

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    // acá podrías hacer fetch() si quisieras enviar a un backend
    modal.setAttribute('aria-hidden','false');
  });

  modal.addEventListener('click', (e)=>{
    if(e.target.matches('[data-close]') || e.target.classList.contains('modal-backdrop')){
      modal.setAttribute('aria-hidden','true');
      form.reset();
    }
  });

  window.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false'){
      modal.setAttribute('aria-hidden','true');
    }
  });
});
// === Matrix Canvas SOLO en el header ===
document.addEventListener('DOMContentLoaded', ()=>{
  const header = document.querySelector('.site-header');
  if(!header) return;

  // Crear canvas y montarlo detrás del contenido
  const cvs = document.createElement('canvas');
  cvs.className = 'matrix-canvas';
  header.appendChild(cvs);
  const ctx = cvs.getContext('2d');

  // Parámetros “tuneables”
  const FONT = 10;          // tamaño de los dígitos
  const SPEED = 1.2;        // velocidad de caída (1–2 lindo)
  const FADE = 0.05;        // estela (0.05 más larga, 0.12 más corta)
  const COLOR1 = '#7CFF7A'; // verde principal
  const COLOR2 = '#22c55e'; // verde secundario
  const CHARS = '01';

  let cols = 0;         // columnas
  let drops = [];       // y actual de cada columna
  let raf = null;

  function resize(){
    // tamaño igual al header visible
    const rect = header.getBoundingClientRect();
    cvs.width  = Math.ceil(rect.width);
    cvs.height = Math.ceil(rect.height);
    // recalcular columnas y reiniciar drops
    cols = Math.floor(cvs.width / FONT);
    drops = new Array(cols).fill(0).map(()=> (Math.random()*-40)|0); // arranque desfasado
    // fondo transparente (estela la maneja el rect semi-transparente)
    ctx.clearRect(0,0,cvs.width,cvs.height);
    // seteo de fuente
    ctx.font = `${FONT}px ui-monospace, Consolas, monospace`;
  }

  function step(){
    // “borrado” con alpha para estela
    ctx.fillStyle = `rgba(0, 0, 0, ${FADE})`;
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    for(let i=0;i<cols;i++){
      const x = i * FONT + 2;      // leve offset para que no quede pegado
      const y = drops[i] * FONT;
      // gradiente vertical para variar tonos de verde
      const g = ctx.createLinearGradient(x, y-FONT*1.5, x, y+FONT*1.5);
      g.addColorStop(0, COLOR2);
      g.addColorStop(1, COLOR1);
      ctx.fillStyle = g;

      const ch = CHARS[Math.random() * CHARS.length | 0];
      ctx.fillText(ch, x, y);

      // reinicio aleatorio cuando sale del canvas
      if (y > cvs.height && Math.random() > 0.975) {
        drops[i] = (Math.random()*-20)|0;
      } else {
        drops[i] += SPEED;
      }
    }
    raf = requestAnimationFrame(step);
  }

  // Pausar si la pestaña no está visible (ahorra CPU)
  function onVis(){
    if(document.hidden){ cancelAnimationFrame(raf); raf = null; }
    else if(!raf){ raf = requestAnimationFrame(step); }
  }

  // init
  resize();
  raf = requestAnimationFrame(step);
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', onVis);
});
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('navToggle');
  const menu = document.getElementById('dropdownMenu');

  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('show');
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('show');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
});

