# biocurl

- Client make a request to a lambda
- File is in the server?
  - No:
    1. Server make a request to ftp.ncbi... 
    2. Server download file
    3. Server gunzip file
    4. Server parse the file
    5. Server save the file, hashing the name, save the gff scheme too
  - Yes:
    1. Server read the file
    2. Server filter the file
    3. Server gzip the file
    4. Server send the file
- Client gunzip the file
- Client write the file 


2.
biocurl https://ftp.ncbi.nlm.nih.gov/.../GCF_000002035.6_GRCz11_genomic.gff.gz --filter { source: Gnomon }
biocurl https://ftp.ncbi.nlm.nih.gov/.../GCF_000002035.6_GRCz11_genomic.gff.gz --scheme
