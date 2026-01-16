const AdPanel = () => {
  return (
    <div className="h-full broadcast-card rounded-lg flex flex-col">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Match Details</h3>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-3 rounded-lg bg-muted/30 flex items-center justify-center">
            <span className="text-2xl">📺</span>
          </div>
          <p className="text-sm">Select a match for details</p>
          <p className="text-xs mt-1 opacity-60">or advertisement space</p>
        </div>
      </div>
    </div>
  );
};

export default AdPanel;
