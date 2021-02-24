clearvars
close all
clc

folderPath = '/Users/bedoya/OneDrive/COSMOS/Docs/Citizen_Science/Questionnaires/Volume_calibration/';
audioName  = 'Kreisler_Loves-Joy_Rachmaninoff-excerpt_normalized_-20dB_RMS.mp3';
L          = get_loudness(fullfile(folderPath,audioName), 'all', false, false);

%% Plot
x0        = 0;
y0        = 0;
width     = 640; %px
height    = 100; %px
areaColor = [96, 96, 96]/255;
backColor = [192,192,192]/255;
figName   = 'loudness.svg';

t  = L(:,1);
L1 = L(:,4);
area(t,L1,'FaceColor', 'None', 'EdgeColor', areaColor)
xlim([min(t), max(t)])
ylim([min(L1), max(L1)])
set(gca,'xtick',[],'ytick',[])
set(gcf,'units','pixels','position',[x0,y0,width,height])
set(gca, 'color', backColor)
axis off
% exportgraphics(gca,fullfile(folderPath,figName),'Resolution',300)
