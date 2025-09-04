(function(){
  const g = (n,f)=>{ try{ if(typeof window[n]!=='function' && typeof f==='function'){ window[n]=f; } }catch(_){ } };
  // Aggiungi qui alias comuni nel caso vengano usati inline in storico.html:
  // Esempi (sostituisci solo se realmente presenti inline):
  // g('filtraStorico', typeof filtraStorico==='function'? filtraStorico : undefined);
  // g('exportExcel',  typeof exportExcel ==='function'? exportExcel  : undefined);
  // g('exportPDF',    typeof exportPDF   ==='function'? exportPDF    : undefined);
})();
