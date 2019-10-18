#!/usr/bin/perl
my $filename = "/root/textfile_collector/pm2errors.prom";
my $logfile = "/logs/show";
my $parameters = 0;
sub  trim { my $s = shift; $s =~ s/^\s+|\s+$//g; return $s };

open(my $fh, '<', $logfile);
open(my $fw, '>', $filename);
# fetching log file
while (my $row = <$fh>) {
  chomp $row;
  if($parameters && index($row, '─────') == -1){
   my @params = split("│", $row);
   my $pname = lc trim(@params[1]);
   $pname =~ s/ /_/ig;
   my $pvalue = trim(@params[2]);
   # special parsing for uptime and status
   if($pname eq 'uptime'){
        my $pvalue_digit = $pvalue;
        $pvalue_digit =~ s/[^0-9]//g;
        #print($pvalue);
        if(index($pvalue, 'h') != -1){
                $pvalue = $pvalue_digit * 60;
        }
        if(index($pvalue, 'd') != -1){
                $pvalue = $pvalue_digit * 60 * 24;
        }
        if(index($pvalue, 'm') != -1){
                $pvalue = $pvalue_digit;
        }
        if(index($pvalue, 's') != -1){
                $pvalue = $pvalue_digit / 60;
        }
   }
   if($pname eq 'status'){
       if($pvalue eq 'online'){
           $pvalue = 1;
       }else{           
            $pvalue = 0;
       }
   }
   #print($pvalue =~ qr/^[0-9\.]+$/);
   my $dotscount = () = $pvalue =~ /\./g;
   # only numerical values goes to metrics
   if($pname && $pvalue =~ qr/^[0-9\.]+$/ && $dotscount < 2){
     print $fw 'pm2_'.$pname . ' ' . $pvalue ."\n";
   }

  }
  if(index($row, '────') != -1){
   if($paremeters){
     $parameters = 0;
   }else{
     $parameters = 1;
   }
  }

}
close $fw;
close $fh;
exit 0;
